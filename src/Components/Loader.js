

import React, { CSSProperties } from 'react';
import ClipLoader from "react-spinners/ClipLoader";



const Loader = () => {
  return (
    <div className="loader-container">
      <ClipLoader
        color='#2f2f2f'
        size={30}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  )
}

export default React.memo(Loader)

