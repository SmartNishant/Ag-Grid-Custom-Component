import axios from 'axios';
import type { AxiosRequestConfig }  from 'axios'

const axiosApiInstance = axios.create({
  baseURL: 'https://squad1e.emgage-dev2.com/api/v1/appdefs'
});

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async (config: any) => {
    config.headers = {
      Authorization: `Bearer eyJraWQiOiJyT1hYRmtnSmtKdDlmZXVwTDh6QVZBaEpaWUFleUlQQVRNNlZCdzduOE00PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzZDM5N2FmZS02YzU1LTQwNDItOWFmMi1mYzhkNTg5YzMyODMiLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy13ZXN0LTJfNEtaSDdmODZVX0VtZ2FnZSJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl80S1pIN2Y4NlUiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI2Z2tiZ2Nxc2Rmcm1pdnZyZ3VyZGFjMnBxZSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2NzY2NDQ3ODMsImV4cCI6MTY3NjY0ODM4MywiaWF0IjoxNjc2NjQ0NzgzLCJqdGkiOiJhMWM3OWI5OS0xZjE0LTQ5YjctYWY1MC1lYTk4YjYyNjQ0ZTQiLCJ1c2VybmFtZSI6IkVtZ2FnZV9uaXNoYW50Y0BlbWdhZ2UuY29tIn0.OOE8pSnhpFXyV7llLFqGA2_7mhaipiD0u1Aeq5QygBrO6ZETyURfegS6JgFr7pnyS6vC7-QZkThtgoITYqpwWS79BHs7j7SAfPmaj5FOGJla2uVsVzjpgC4s4RVmZ__b-S2UTnODBVikNif8ztjE0MnqzNrnY1lu5ulK-q9ubvkLSaZmHrbhe_TKNcUnYbRSx7qKCzUtah61lp19i7vaCUv3JE7T3unCU8M_qlF7Gk3-8e-KSIGvLAyDkUIJmgfP_xj4u-11gDSgci0-ohpGV8qPFcyUSci8PlBwIxmmDpVxfLQztTvuLiYHA_ViOoEZjN7dFlqA4EjeavDX0FUH_A`,
      Accept: 'application/json',
      // "Access-Control-Allow-Origin": '*'
    };
    return config;
  },
  (error) => {
    console.log({error})
    Promise.reject(error);
  }
);

export default axiosApiInstance;
