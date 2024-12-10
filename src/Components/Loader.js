

import React, { CSSProperties } from 'react';
import ClipLoader from "react-spinners/ClipLoader";

// const override:CSSProperties= {
//     display: "block",
//     margin: "0 auto",
//     borderColor: "white",
//   };

const Loader = () => {
  return (
    <div className="loader-container">
      <ClipLoader
        color='#26245c'
        size={30}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  )
}

export default React.memo(Loader)

