import axios from 'axios';
import type { AxiosRequestConfig }  from 'axios'

const axiosApiInstance = axios.create({
  baseURL: 'https://squad1e.emgage-dev2.com/api/v1/appdefs'
});

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async (config: any) => {
    config.headers = {
      Authorization: `Bearer eyJraWQiOiJyT1hYRmtnSmtKdDlmZXVwTDh6QVZBaEpaWUFleUlQQVRNNlZCdzduOE00PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzZDM5N2FmZS02YzU1LTQwNDItOWFmMi1mYzhkNTg5YzMyODMiLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy13ZXN0LTJfNEtaSDdmODZVX0VtZ2FnZSJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl80S1pIN2Y4NlUiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI2Z2tiZ2Nxc2Rmcm1pdnZyZ3VyZGFjMnBxZSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2ODEzMDQ0MDcsImV4cCI6MTY4MTMwODAwNywiaWF0IjoxNjgxMzA0NDA3LCJqdGkiOiI0Y2EzMjY1OC00NGE4LTQ1MzQtYTE0OS01ZGM0YjZmYTgyNDkiLCJ1c2VybmFtZSI6IkVtZ2FnZV9uaXNoYW50Y0BlbWdhZ2UuY29tIn0.XpFHGXOJSgLyT33oneth4SN2d1w-55Xkaqb3daidnVcdHvHeXIVWQ8Ww0rrIJLSMxXeFynpg9KripaOwZ5TQGHSzhfmjUFadwib3kFtAu6UPMkqRiGUNf1WZyuwn35Uqs11gjrEmoojOdMLII6Ysp1qXShYlQmaq_DNIi4yeKx_yswqId56MscJ-5JB8aqeP-D2QkOrOva1orl7_vcddA_ctJ9plWNiOlqFsLdu07AT8TILa7GniB2u2vgKyMKfVOqvntXp8YIvNJNp7j7QGe6yDQ3YN85dgtIbDA0I2Tdl6bSEt9eNc19iU-iqNX_JzY3XV4oKFKdy2pQJy1nUtzQ`,
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
