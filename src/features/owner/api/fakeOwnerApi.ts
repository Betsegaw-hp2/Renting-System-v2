// import { getAuthToken } from "@/lib/cookies"
// import apiClient from "../../../api/client"

// export interface User {
//     id: string
//     first_name: string
//     last_name: string
//     email: string
//     profile_picture?: string
// }

// export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
// export type PaymentStatus = "pending" | "completed" | "in_escrow" | "disputed" | "failed";

// export interface Booking {
//     id: string
//     listing_id: string
//     renter_id: string
//     owner_id: string
//     start_date: string
//     end_date: string
//     total_amount: number
//     status: BookingStatus
//     payment_status: PaymentStatus
//     payment_reference: string
//     created_at: string
//     updated_at: string

//     // Add populated user fields:
//     renter?: User
//     owner?: User
// }



// export const fakeOwnerApi = {
//     updateBookingStatus: async (bookingId: string, status: BookingStatus): Promise<{ success: boolean; updated: Partial<Booking> }> => {
//         await new Promise((resolve) => setTimeout(resolve, 800));

//         return {
//             success: true,
//             updated: {
//                 id: bookingId,
//                 status,
//                 updated_at: new Date().toISOString(),
//             },
//         };
//     }
// }
