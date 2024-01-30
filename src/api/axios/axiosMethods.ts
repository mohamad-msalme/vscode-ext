import { axiosInstance } from "./axiosInstanse";
import { validateStatus } from "./validateStatus";
import { AxiosRequestConfig, AxiosResponse, Method } from "axios";

/**
 * The `sendRequest` function is a TypeScript function that sends HTTP requests using Axios and returns
 * the response data, optionally mapping it using a provided mapper function.
 * @param {Method} method - The HTTP method to be used for the request (e.g., "GET", "POST", "PATCH",
 * "PUT", "DELETE").
 * @param {string} url - The `url` parameter is a string that represents the URL of the API endpoint
 * that you want to send a request to.
 * @param {TPayload} [payload] - The `payload` parameter is an optional parameter that represents the
 * data that you want to send along with the request. It is of type `TPayload`, which is a generic type
 * that can be any type or undefined.
 * @param [mapper] - The `mapper` parameter is an optional function that is used to transform the
 * response data before returning it. It takes the response data of type `TR` as input and returns the
 * transformed data of type `TD`. If the `mapper` function is not provided, the original response data
 * of type `
 * @param {AxiosRequestConfig} [config] - The `config` parameter is an optional object that allows you
 * to customize the Axios request configuration. It includes options such as headers, timeout,
 * authentication, and more. You can pass this object to the Axios request methods (`get`, `post`,
 * `patch`, `put`, `delete`) to modify
 * @returns The `sendRequest` function returns a `Promise` that resolves to either `TD` or `TR`. If a
 * `mapper` function is provided, it will return the mapped data of type `TD`. Otherwise, it will
 * return the original response data of type `TR`.
 */
const sendRequest = async <TR, TD, TPayload = unknown>(
  method: Method,
  url: string,
  payload?: TPayload,
  mapper?: (data: TR) => TD,
  config?: AxiosRequestConfig,
): Promise<TR | TD> => {
  const _config: AxiosRequestConfig = {
    ...config,
    validateStatus: (status) => {
      const result = validateStatus(url, method, status);
      return config?.validateStatus ? config.validateStatus(status) : result;
    },
  };
  let response: AxiosResponse<TR>;
  switch (method.toUpperCase()) {
    case "GET":
      response = await axiosInstance.get(url, _config);
      break;
    case "POST":
      response = await axiosInstance.post(url, payload, _config);
      break;
    case "PATCH":
      response = await axiosInstance.patch(url, payload, _config);
      break;
    case "PUT":
      response = await axiosInstance.put(url, payload, _config);
      break;
    case "DELETE":
      response = await axiosInstance.delete(url, _config);
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
  return mapper ? mapper(response.data) : response.data;
};

/**
 * The function is an asynchronous GET request that can map the response data to a different type.
 * @param {string} url - The `url` parameter is a string that represents the URL of the API endpoint
 * you want to make a GET request to.
 * @param [mapper] - The `mapper` parameter is an optional function that can be used to transform the
 * response data before returning it. It takes the response data of type `TR` as input and returns the
 * transformed data of type `TD`. If the `mapper` function is not provided, the response data will be
 * returned
 * @param {AxiosRequestConfig} [config] - The `config` parameter is an optional object that allows you
 * to customize the Axios request configuration. It can include properties such as headers, query
 * parameters, request timeout, and more. You can refer to the Axios documentation for a full list of
 * available options.
 */
export const getApi = async <TR = unknown, TD = unknown>(
  url: string,
  mapper?: (data: TR) => TD,
  config?: AxiosRequestConfig,
): Promise<TD | TR> => sendRequest("GET", url, undefined, mapper, config);

/**
 * The function is a TypeScript implementation of a POST request with optional data mapping.
 * @param {string} url - The URL where the POST request will be sent.
 * @param {TPayload} payload - The `payload` parameter is the data that you want to send in the request
 * body. It can be of any type (`TPayload`).
 * @param [mapper] - The `mapper` parameter is an optional function that can be used to transform the
 * response data (`TR`) into a different format (`TD`). It takes the response data as input and returns
 * the transformed data. This can be useful if you want to modify or extract specific properties from
 * the response before using it
 * @param {AxiosRequestConfig} [config] - The `config` parameter is an optional object that allows you
 * to customize the Axios request configuration. It can include properties such as headers, timeout,
 * authentication, and more. You can refer to the Axios documentation for a full list of available
 * options.
 */
export const postApi = async <TR = unknown, TD = unknown, TPayload = unknown>(
  url: string,
  payload: TPayload,
  mapper?: (data: TR) => TD,
  config?: AxiosRequestConfig,
): Promise<TD | TR> => sendRequest("POST", url, payload, mapper, config);

/**
 * The `patch` function sends a PATCH request to a specified URL with an optional payload, mapper
 * function, and Axios request configuration, and returns the mapped response data or the raw response
 * data.
 * @param {string} url - The URL of the API endpoint where the PATCH request will be sent.
 * @param {TPayload} payload - The `payload` parameter is the data that you want to send in the PATCH
 * request. It can be of any type (`TPayload`).
 * @param [mapper] - The `mapper` parameter is an optional function that can be used to transform the
 * response data (`TR`) into a different format (`TD`). It takes the response data as input and returns
 * the transformed data. This can be useful if you want to modify or extract specific properties from
 * the response data before using
 * @param {AxiosRequestConfig} [config] - The `config` parameter is an optional object that allows you
 * to customize the Axios request configuration. It can include properties such as headers, timeout,
 * authentication, etc.
 */
export const patchApi = async <TR = unknown, TD = unknown, TPayload = unknown>(
  url: string,
  payload: TPayload,
  mapper?: (data: TR) => TD,
  config?: AxiosRequestConfig,
): Promise<TD | TR> => sendRequest("PATCH", url, payload, mapper, config);

/**
 * This function sends a PUT request to a specified URL with an optional payload and returns the
 * response data after applying a mapper function if provided.
 * @param {string} url - The URL where the PUT request will be sent.
 * @param {TPayload} payload - The `payload` parameter is the data that you want to send in the request
 * body. It can be of any type (`TPayload`).
 * @param [mapper] - The `mapper` parameter is an optional function that can be used to transform the
 * response data (`TR`) into a different format (`TD`). It takes the response data as input and returns
 * the transformed data. This can be useful if you want to modify or extract specific properties from
 * the response before using it
 * @param {AxiosRequestConfig} [config] - The `config` parameter is an optional object that allows you
 * to customize the request configuration. It can include properties such as headers, query parameters,
 * authentication tokens, etc. You can refer to the Axios documentation for more details on the
 * available options for the `config` object.
 */
export const putApi = async <TR = unknown, TD = unknown, TPayload = unknown>(
  url: string,
  payload: TPayload,
  mapper?: (data: TR) => TD,
  config?: AxiosRequestConfig,
): Promise<TD | TR> => sendRequest("PUT", url, payload, mapper, config);

/**
 * The function `remove` sends a DELETE request to a specified URL and returns the response data after
 * applying a mapper function if provided.
 * @param {string} url - The `url` parameter is a string that represents the URL of the resource you
 * want to delete.
 * @param [mapper] - The `mapper` parameter is an optional function that can be used to transform the
 * response data before returning it. It takes the response data of type `TR` as input and returns the
 * transformed data of type `TD`. If the `mapper` function is not provided, the response data will be
 * returned
 * @param {AxiosRequestConfig} [config] - The `config` parameter is an optional object that allows you
 * to customize the Axios request configuration. It can include properties such as headers, query
 * parameters, timeout, authentication, etc.
 */
export const removeApi = async <TR = unknown, TD = unknown>(
  url: string,
  mapper?: (data: TR) => TD,
  config?: AxiosRequestConfig,
): Promise<TD | TR> => sendRequest("DELETE", url, undefined, mapper, config);
