import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import React from "react";

const useStyles = makeStyles(() => ({
  stripeComponent: {
    padding: " 50px !important",
    display: "flex",
  },
}));

const CheckoutForm = () => {
  const classes = useStyles();
  const [formState, setFormState] = React.useState({
    email: "lokender111@gmail.com",
    amount: "2000",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Call your backend to create the Checkout Session
    const response1 = await axios
      .post("http://localhost:4000/api/payment", formState)
      .catch((err) => {
        console.log(err);
      });

    console.log(response1);

    var information = {
      action: "https://securegw-stage.paytm.in/order/process",
      params: response1.data,
    };
    post(information);

    // console.log(response2);
  };

  const handleChange = (event) => {
    event.persist();
    setFormState((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
    }));
  };

  function isDate(val) {
    // Cross realm comptatible
    return Object.prototype.toString.call(val) === "[object Date]";
  }

  function isObj(val) {
    return typeof val === "object";
  }

  function stringifyValue(val) {
    if (isObj(val) && !isDate(val)) {
      return JSON.stringify(val);
    } else {
      return val;
    }
  }

  function buildForm({ action, params }) {
    const form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", action);

    Object.keys(params).forEach((key) => {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", key);
      input.setAttribute("value", stringifyValue(params[key]));
      form.appendChild(input);
    });

    return form;
  }

  function post(details) {
    const form = buildForm(details);
    document.body.appendChild(form);
    form.submit();
    form.remove();
  }
  return (
    <div className={classes.stripeComponent}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Email"
            variant="outlined"
            s
            name="email"
            value={formState.email || ""}
            type="text"
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="amount"
            variant="outlined"
            name="amount"
            value={formState.amount || ""}
            type="text"
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Checkout
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

const Paytm = () => <CheckoutForm />;

export default Paytm;
