// import React from 'react';

// class ErrorPage extends React.Component {
//   static getInitialProps({ res, err }) {
//     const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
//     return { statusCode };
//   }

//   render() {
//     const { statusCode } = this.props;
//     return (
//       <div>
//         <p>{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</p>
//       </div>
//     );
//   }
// }

// export default ErrorPage;
// ===============>>>>>>>>>>>>>
// const Error = () => {
//   return {};
// };

// export default Error;
import React from 'react';

class ErrorPage extends React.Component {
  static getInitialProps({ res, err }) {
    return {};
  }

  componentDidMount(){
    history.go(0);
  }
  render() {
    return (
      <div>
        <p>An error occurred.</p>
      </div>
    );
  }
}

export default ErrorPage;