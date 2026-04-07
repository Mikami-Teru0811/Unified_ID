import { createContext, useContext, useState } from "react";

const PatientRegistrationContext = createContext();

export function PatientRegistrationProvider({ children }) {
    const [data, setData] = useState({
        personal: {},
        contact: {},
        medical: {},
        nfcId: null,
        patientId: null,
        fingerprintId: null,
    });

    const update = (section, values) =>
        setData(prev => ({ ...prev, [section]: values }));

    return (
        <PatientRegistrationContext.Provider value={{ data, update }}>
            {children}
        </PatientRegistrationContext.Provider>
    );
}

export const usePatientRegistration = () =>
    useContext(PatientRegistrationContext);
