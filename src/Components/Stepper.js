

import React, { useState } from 'react';

const Stepper = ({ steps }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const goToStep = (step) => {
        setCurrentStep(step);
    };

    return (
        <div className="stepper">
            <div className="steps">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`step ${index === currentStep ? 'active' : ''}`}
                        onClick={() => goToStep(index)}
                    >
                        {step.label}
                    </div>
                ))}
            </div>
            <div className="step-content">
                {steps[currentStep].component}
            </div>
            <div className="navigation">
                <button onClick={prevStep} disabled={currentStep === 0}>Previous</button>
                <button onClick={nextStep} disabled={currentStep === steps.length - 1}>Next</button>
            </div>
        </div>
    );
};

export default Stepper;
