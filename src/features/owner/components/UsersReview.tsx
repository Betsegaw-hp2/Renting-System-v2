// import { useUserProfile } from '@/features/users/useUserProfile';

// interface UsersReviewProps {
//   userId: string;
//   review: string;
// }

// const UsersReview = ({ userId, review }: UsersReviewProps) => {
//   const { realUser, loading, error } = useUserProfile(userId);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;
//   if (!realUser) return <div>No user found</div>;

//   const getInitials = (firstName?: string, lastName?: string) => {
//     if (firstName && lastName) {
//       return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
//     }
//     return "R";
//   };

//   return (
//     <div className="p-4 border rounded-md shadow-sm bg-white space-y-2">
//       <div className="flex items-center gap-2">
//         <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-white">
//           {getInitials(realUser.first_name, realUser.last_name)}
//         </div>
//         <div className="text-sm font-medium">{realUser.first_name} {realUser.last_name}</div>
//       </div>
//       <p className="text-sm text-gray-700">{review}</p>
//     </div>
//   );
// };

// export default UsersReview;
