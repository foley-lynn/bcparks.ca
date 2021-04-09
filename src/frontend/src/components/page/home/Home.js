import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { useKeycloak } from "@react-keycloak/web";
import { Button } from "shared-components/build/components/button/Button";
import { Input } from "shared-components/build/components/input/Input";
import styles from "./Home.css";

export default function Home({ page: { setError } }) {
  const { keycloak } = useKeycloak();
  const [toError, setToError] = useState(false);
  const [toAdvisoryDashboard, setToAdvisoryDashboard] = useState(false);

  useEffect(() => {
    setToAdvisoryDashboard(keycloak.authenticated);
  }, [setToAdvisoryDashboard, keycloak]);

  const usernameInput = {
    label: "",
    id: "username",
    isReadOnly: false,
    isRequired: false,
    placeholder: "ID",
  };
  const passwordInput = {
    label: "",
    id: "password",
    isReadOnly: false,
    isRequired: false,
    placeholder: "Password",
  };

  if (toError) {
    return <Redirect to="/bcparks/error" />;
  }

  if (toAdvisoryDashboard) {
    return <Redirect to="/bcparks/advisory-dash" />;
  }

  return (
    <main>
      <div className={styles.Home} data-testid="Home">
        <div className="container hm-container">
          <h1>Welcome to BC Parks Public Advisories</h1>
          <h3>Please log in here to access Public Advisory:</h3>
          <div className="row">
            <div className="col-lg-4"></div>
            <div className="col-lg-4">
              <form className="form-home">
                <div className="container-fluid ad-form">
                  <div className="row hm-row ">
                    <Input
                      input={{
                        ...usernameInput,
                        styling: "bcgov-editable-white",
                      }}
                      onChange={(event) => {}}
                    />
                  </div>
                  <div className="row hm-row ">
                    <Input
                      input={{
                        ...passwordInput,
                        styling: "bcgov-editable-white",
                      }}
                      onChange={(event) => {}}
                    />
                  </div>
                  <div className="row hm-row ">
                    <Button
                      onClick={() => keycloak.login()}
                      label="Login"
                      styling="bcgov-normal-yellow btn"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div>
            <p>Can't login? call XXX-XXX-XXXX</p>
            <p>
              If you are a <b>contract field staff</b>, please call your
              <br /> regional staff representative to report any advisory.
              <br />
              Business hours of the web team: <br />
              Monday-Friday 8:30 am to 4:30 pm
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

Home.propTypes = {
  page: PropTypes.shape({
    setError: PropTypes.func.isRequired,
    header: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
