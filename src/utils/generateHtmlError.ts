/**
 * The function `generateHtmlError` generates an HTML error page with a customizable error message.
 * @param {string} [msg=Somthing went wrong, Please try again] - The `msg` parameter is a string that
 * represents the error message to be displayed in the HTML. If no value is provided, the default error
 * message "Something went wrong, Please try again" will be used.
 * @returns The function `generateHtmlError` returns an HTML string that displays an error message. The
 * error message is passed as an argument to the function, and if no argument is provided, a default
 * error message is used.
 */
export const generateHtmlError = (
  msg = "Somthing went wrong, Please try again",
) => {
  return `
        <!doctype html>
        <html lang="en">
                <head>
                        <meta charset="utf-8"/>
                        <title>Your App</title>
                        <link rel="preconnect" href="https://fonts.googleapis.com"/>
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
                        <style>
                          #root {
                            font-size: 18px;
                            font-weight: 600
                            color: white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100vw;
                            height: 100vh;
                            background-color: #111827
                          }
                        </style>
                </head>
                <body>
                        <div id="root">
                          ${msg}
                        </div>
                </body>
        </html>
        `;
};
