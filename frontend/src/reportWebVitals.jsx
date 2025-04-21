/**
 * File: frontend/src/reportWebVitals.jsx
 * Author: React Project File
 * Date: 3/10/25
 * Updated: 4/20/25
 * Description: Standard React Project File - Auto Generated
 **/

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
