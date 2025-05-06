import { prisma } from "../../core/prismaClient";
import bcrypt from "bcryptjs";

// Get user by ID
export const getUserById = async (id: string) => {
    try { // Add a try-catch block here as well
      const user = await prisma.user.findUnique({
          where: { id },
          select: {
              id: true,
              name: true,
              email: true,
              description: true,
              theme: true,
              audioNotification: true,
              profilePicPath: true, // Make sure this is true to fetch the data
              password: true, // used internally in controller for password check
          },
      });
  
      // Add the log here, BEFORE the return
      console.log("Retrieved profilePicPath from DB in service:", user?.profilePicPath ? user.profilePicPath.substring(0, 50) + '...' : 'null'); // Log first 50 chars of retrieved data
      console.log("Length of retrieved base64 string:", user?.profilePicPath?.length); // Log total length
  
  
      return user; // Return the retrieved user object
  
     } catch (error) {
         console.error("Error fetching user by ID:", error);
         throw error;
     }
  };

// Update general user settings
export const updateSettings = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    description?: string;
    theme?: string;
    audioNotification?: boolean;
  }
) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      description: true,
      theme: true,
      audioNotification: true,
    },
  });
};

// Update user password
export const updatePassword = async (id: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
};

// Update profile picture
export const updateProfilePicture = async (id: string, base64Image: string) => {
    console.log("Attempting to save base64Image in service:", base64Image ? base64Image.substring(0, 50) + '...' : 'null'); // Log first 50 chars
  
    try { // Add a try-catch block here to handle potential Prisma errors
       const updatedUser = await prisma.user.update({
          where: { id },
          data: { profilePicPath: base64Image },
          select: { // Select the fields you want returned after the update
              id: true,
              profilePicPath: true,
          },
       });
  
       // Add the log here, AFTER the update and assignment to updatedUser, but BEFORE the return
       console.log("Saved user profilePicPath:", updatedUser?.profilePicPath ? updatedUser.profilePicPath.substring(0, 50) + '...' : 'null'); // Log first 50 chars of saved data
       console.log("Length of saved base64 string:", updatedUser?.profilePicPath?.length); // Log total length
  
  
       return updatedUser; // Return the result of the update
  
    } catch (error) {
        console.error("Error saving profile picture:", error); // Log any errors during the update
        throw error; // Re-throw the error so the controller can handle it
     }
  };