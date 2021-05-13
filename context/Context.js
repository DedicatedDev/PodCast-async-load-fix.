import React, { createContext } from "react";

const Context = createContext({
  setId: () => {
    console.log("SETY OD");
  },
  getId: null,
  providerId: null,
});

export default Context;