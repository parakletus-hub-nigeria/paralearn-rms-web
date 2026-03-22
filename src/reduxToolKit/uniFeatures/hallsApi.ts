import { uniApi } from "../api/uniBaseApi";

export interface Hall {
  id: string;
  name: string;
  capacity?: number;
  building?: string;
  geoLat?: number;
  geoLng?: number;
  geoRadiusMeters?: number;
}

export const hallsApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    getHalls: builder.query<any, void>({
      query: () => ({ url: "/admin/halls", method: "GET" }),
      providesTags: ["Hall"],
    }),
    createHall: builder.mutation<
      any,
      { name: string; capacity?: number; building?: string; geoLat?: number; geoLng?: number; geoRadiusMeters?: number }
    >({
      query: (body) => ({ url: "/admin/halls", method: "POST", body }),
      invalidatesTags: ["Hall"],
    }),
    updateHall: builder.mutation<
      any,
      { id: string; name?: string; capacity?: number; building?: string; geoLat?: number; geoLng?: number; geoRadiusMeters?: number }
    >({
      query: ({ id, ...body }) => ({ url: `/admin/halls/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Hall"],
    }),
    deleteHall: builder.mutation<any, string>({
      query: (id) => ({ url: `/admin/halls/${id}`, method: "DELETE" }),
      invalidatesTags: ["Hall"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHallsQuery,
  useCreateHallMutation,
  useUpdateHallMutation,
  useDeleteHallMutation,
} = hallsApi;
