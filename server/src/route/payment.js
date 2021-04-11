const express = require("express");
const router = express.Router();
const PaytmChecksum = require("../utils/PaytmChecksum");
const { v4: uuidv4 } = require("uuid");
const https = require("https");
const formidable = require("formidable");

router.post("/callback", (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, file) => {
    paytmChecksum = fields.CHECKSUMHASH;
    delete fields.CHECKSUMHASH;

    var isVerifySignature = PaytmChecksum.verifySignature(
      fields,
      process.env.PAYTM_PAYMENT_MERCHANT_KEY,
      paytmChecksum
    );
    if (isVerifySignature) {
      var paytmParams = {};
      paytmParams["MID"] = fields.MID;
      paytmParams["ORDERID"] = fields.ORDERID;

      /*
       * Generate checksum by parameters we have
       * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
       */
      PaytmChecksum.generateSignature(
        paytmParams,
        process.env.PAYTM_PAYMENT_MERCHANT_KEY
      ).then(function (checksum) {
        paytmParams["CHECKSUMHASH"] = checksum;

        var post_data = JSON.stringify(paytmParams);

        var options = {
          /* for Staging */
          hostname: "securegw-stage.paytm.in",

          /* for Production */
          // hostname: 'securegw.paytm.in',

          port: 443,
          path: "/order/status",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };

        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });

          post_res.on("end", function () {
            res.json(response);
          });
        });

        post_req.write(post_data);
        post_req.end();
      });
    } else {
      console.log("Checksum Mismatched");
    }
  });
});

router.post("/payment", (req, res) => {
  const { amount, email } = req.body;
  var params = {};

  /* initialize an array */
  params["MID"] = process.env.PAYTM_PAYMENT_MERCHANT_ID;
  params["WEBSITE"] = process.env.PAYTM_PAYMENT_WEBSITE;
  params["CHANNEL_ID"] = process.env.PAYTM_PAYMENT_CHANNEL_ID;
  params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_PAYMENT_INDUSTRY_TYPE;
  params["CUST_ID"] = "CUST_001";

  params["ORDER_ID"] = uuidv4();
  params["TXN_AMOUNT"] = amount;
  params["CALLBACK_URL"] = "http://localhost:4000/api/callback";
  params["EMAIL"] = email;
  params["MOBILE_NO"] = "7777777777";

  /**
   * Generate checksum by parameters we have
   * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
   */
  var paytmChecksum = PaytmChecksum.generateSignature(
    params,
    process.env.PAYTM_PAYMENT_MERCHANT_KEY
  );
  paytmChecksum
    .then(function (checksum) {
      console.log("generateSignature Returns: " + checksum);
      let paytmParams = {
        ...params,
        CHECKSUMHASH: checksum,
      };
      res.json(paytmParams);
    })
    .catch(function (error) {
      console.log(error);
    });
});

module.exports = router;
