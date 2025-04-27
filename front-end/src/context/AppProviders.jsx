// src/context/AppProviders.jsx
import React from "react";
import { AuthProvider } from "./AuthContext";
import { CompensationProvider as GlobalCompensationProvider } from "./CompensationContext";
import { SharedDataProvider as GlobalSharedDataProvider } from "./SharedDataContext";

import { CompensationProvider as BusinessCompensationProvider } from "./electricity-violation-business/CompensationContext";
import { SharedDataProvider as BusinessSharedDataProvider } from "./electricity-violation-business/SharedDataContext";

import { CompensationProvider as HouseholdCompensationProvider } from "./electricity-violation-household/CompensationContext";
import { SharedDataProvider as HouseholdSharedDataProvider } from "./electricity-violation-household/SharedDataContext";

import { CompensationProvider as ProductionCompensationProvider } from "./electricity-violation-production/CompensationContext";
import { SharedDataProvider as ProductionSharedDataProvider } from "./electricity-violation-production/SharedDataContext";

import { CompensationProvider as EVCompensationProvider } from "./electricity-violation/CompensationContext";
import { CompensationProvider2 as EVCompensationProvider2 } from "./electricity-violation/CompensationContext2";
import { SharedDataProvider as EVSharedDataProvider } from "./electricity-violation/SharedDataContext";

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <GlobalSharedDataProvider>
        <GlobalCompensationProvider>
          <BusinessSharedDataProvider>
            <BusinessCompensationProvider>
              <HouseholdSharedDataProvider>
                <HouseholdCompensationProvider>
                  <ProductionSharedDataProvider>
                    <ProductionCompensationProvider>
                      <EVSharedDataProvider>
                        <EVCompensationProvider>
                          <EVCompensationProvider2>
                            {children}
                          </EVCompensationProvider2>
                        </EVCompensationProvider>
                      </EVSharedDataProvider>
                    </ProductionCompensationProvider>
                  </ProductionSharedDataProvider>
                </HouseholdCompensationProvider>
              </HouseholdSharedDataProvider>
            </BusinessCompensationProvider>
          </BusinessSharedDataProvider>
        </GlobalCompensationProvider>
      </GlobalSharedDataProvider>
    </AuthProvider>
  );
};

export default AppProviders;
