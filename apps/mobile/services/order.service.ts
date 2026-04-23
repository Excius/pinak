import { apiRequest } from "./api";
import type { OrderApi } from '@repo/types';

// Type imports for order service
type CreateOrderRequest = OrderApi.BodyTypes['CreateOrder'];
type CreateOrderResponse = OrderApi.ResponseTypes['CreateOrder'];
type GetOrdersResponse = OrderApi.ResponseTypes['GetOrders'];
type GetOrderByIdResponse = OrderApi.ResponseTypes['GetOrderById'];
type CancelOrderResponse = OrderApi.ResponseTypes['CancelOrder'];

// Create order from cart
export async function createOrder(payload: CreateOrderRequest) {
    const response = await apiRequest<CreateOrderResponse>(
        'post',
        '/orders',
        payload
    );
    return response;
}

// Get user's orders with optional filters
export async function getOrders(
    page: number = 1,
    limit: number = 10,
    filters?: {
        status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
        paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
    }
) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters?.status) {
        params.append('status', filters.status);
    }
    if (filters?.paymentStatus) {
        params.append('paymentStatus', filters.paymentStatus);
    }

    const queryString = params.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';

    const response = await apiRequest<GetOrdersResponse>('get', url);
    return response;
}

// Get specific order by ID
export async function getOrderById(orderId: string) {
    const response = await apiRequest<GetOrderByIdResponse>(
        'get',
        `/orders/${orderId}`
    );
    return response;
}

// Cancel order
export async function cancelOrder(orderId: string) {
    const response = await apiRequest<CancelOrderResponse>(
        'put',
        `/orders/${orderId}/cancel`,
        {}
    );
    return response;
}
