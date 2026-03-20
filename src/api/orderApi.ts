import { baseApiWithAuth } from './baseApi';
import { 
  OrderResponse, 
  PlaceOrderRequest, 
  AdminOrderSummaryDto, 
  AdminOrderDetailDto, 
  AcceptOrderRequest, 
  AcceptOrderResponse, 
  RejectOrderRequest, 
  RejectOrderResponse, 
  AssignDeliveryRequest, 
  AssignDeliveryResponse,
  DeliveryPersonDto
} from '../types/order';

export const orderApi = baseApiWithAuth.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Customer endpoints
    getMyOrders: builder.query<OrderResponse[], void>({
      query: () => '/orders',
      providesTags: ['Orders'],
    }),
    
    getOrderById: builder.query<OrderResponse, number>({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
    
    placeOrder: builder.mutation<OrderResponse, PlaceOrderRequest>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),
    
    // Admin endpoints
    getAdminOrders: builder.query<AdminOrderSummaryDto[], { 
      orderStatus?: string; 
      paymentStatus?: string;
      paymentMethod?: string;
      startDate?: string; 
      endDate?: string; 
      search?: string 
    } | void>({
      query: (params) => ({
        url: '/admin/orders/all-orders',
        params: params || {},
      }),
      providesTags: ['AdminOrders'],
    }),
    
    getAdminOrderById: builder.query<AdminOrderDetailDto, number>({
      query: (orderId) => `/admin/orders/${orderId}`,
      providesTags: (result, error, id) => [{ type: 'AdminOrders', id }],
    }),
    
    acceptOrder: builder.mutation<AcceptOrderResponse, AcceptOrderRequest | number>({
      query: (arg) => {
        const requestData = typeof arg === 'number' ? { orderId: arg } : arg;
        return {
          url: `/admin/orders/${requestData.orderId}/accept`,
          method: 'POST',
          body: requestData,
        };
      },
      invalidatesTags: ['AdminOrders', 'Dashboard'],
    }),
    
    rejectOrder: builder.mutation<RejectOrderResponse, RejectOrderRequest | { orderId: number; data: RejectOrderRequest }>({
      query: (arg) => {
        let orderId: number;
        let body: any;
        
        if ('data' in arg) {
          orderId = arg.orderId;
          body = arg.data;
        } else {
          orderId = arg.orderId;
          body = arg;
        }
        
        return {
          url: `/admin/orders/${orderId}/reject`,
          method: 'POST',
          body: body,
        };
      },
      invalidatesTags: ['AdminOrders', 'Dashboard'],
    }),
    
    assignDelivery: builder.mutation<AssignDeliveryResponse, AssignDeliveryRequest>({
      query: (requestData) => ({
        url: `/admin/orders/${requestData.orderId}/assign-delivery`,
        method: 'POST',
        body: requestData,
      }),
      invalidatesTags: ['AdminOrders'],
    }),

    getDeliveryPersons: builder.query<DeliveryPersonDto[], void>({
      query: () => '/admin/delivery-persons',
      providesTags: ['AdminOrders'], // Re-using tag for refresh
    }),
  }),
});

export const {
  // Customer hooks
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  usePlaceOrderMutation,
  // Admin hooks
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useAssignDeliveryMutation,
  useGetDeliveryPersonsQuery,
} = orderApi;
