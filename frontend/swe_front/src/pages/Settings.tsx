import { useState, useEffect, useRef } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

interface UserPayload {
  id: string;
  name: string;
  email: string;
  description?: string;
  theme?: string;
  audioNotification?: boolean;
  profilePicPath?: string;
}


const Settings = () => {
  const errRef = useRef<HTMLParagraphElement>(null);

  // Local states
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [validNewPassword, setValidNewPassword] = useState(true);
  const [profilePicURL, setProfilePicURL] = useState<string>("");

  const [theme, setTheme] = useState("adaptive");
  const [audioNotification, setAudioNotification] = useState(true);

  // Validation
  const [validEmail, setValidEmail] = useState(true);
  const [validPassword, setValidPassword] = useState(true);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 Fetch current user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        
        interface UserPayload {
          id: string;
          name: string;
          email: string;
          description?: string;
          theme?: string;
          audioNotification?: boolean;
          profilePicPath?: string;
        }
        
        // 2) Tell axios to expect that shape on res.data:
        const res = await axios.get<UserPayload>(
          "http://localhost:5001/api/users/me/full",
          { withCredentials: true }
        );
        
        const user = res.data;
        setAccountName(user.name || "");
        setEmail(user.email || "");
        setDescription(user.description || "");
        setTheme(user.theme || "adaptive");
        setAudioNotification(user.audioNotification ?? true);
        setProfilePicURL(user.profilePicPath || ""); // <-- setting the profilePicURL here
      } catch (err) {
        setErrorMsg("Failed to load user data.");
        errRef.current?.focus();
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidNewPassword(PWD_REGEX.test(newPassword));
  }, [newPassword]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  
    const handleSave = async () => {
      setErrorMsg("");
      setSuccessMsg("");
    
      // 1. Validation
      if (!validEmail || (changePasswordMode && (!oldPassword || !validNewPassword))) {
        setErrorMsg("Please enter a valid email and valid password.");
        errRef.current?.focus();
        return;
      }
    
      // 2. Convert image
      let profilePicBase64: string | null = null;
      if (profilePic) {
        profilePicBase64 = await fileToBase64(profilePic);
      }
    
      try {
        // A) Update general settings
        await axios.post(
          "http://localhost:5001/api/users/update-settings",
          {
            name: accountName,
            email,
            description,
            theme,
            audioNotification,          // matches controller
          },
          { withCredentials: true }
        );
    
        // B) Update password if in change mode
        if (changePasswordMode) {
          await axios.post(
            "http://localhost:5001/api/users/update-password",
            { oldPassword, newPassword },
            { withCredentials: true }
          );
          // reset password form
          setOldPassword("");
          setNewPassword("");
          setChangePasswordMode(false);
        }
    
        // C) Update profile picture if provided
        if (profilePicBase64) {
          await axios.post(
            "http://localhost:5001/api/users/update-picture",
            { base64Image: profilePicBase64 },
            { withCredentials: true }
          );
        }

        const res = await axios.get<UserPayload>("http://localhost:5001/api/users/me/full", {
          withCredentials: true,
        });
    
        // Update the profile picture URL based on response
        setProfilePicURL(res.data.profilePicPath || "");
    
        setSuccessMsg("Settings saved successfully!");
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.message || "Failed to save settings.");
        errRef.current?.focus();
      }
    };
  

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This is irreversible.")) {
      // Call delete API here
    }
  };

  return (
      <div className="p-4 pl-12 w-full max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}


        <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full overflow-hidden">
          {profilePic ? (
            // Display newly selected image using temporary URL
            <img
              src={URL.createObjectURL(profilePic)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : profilePicURL ? (
            // Display saved image
            // Check if it's a Base64 string and format accordingly
            profilePicURL.startsWith('data:image/') ? (
               <img
                 src={profilePicURL} // Use the Base64 string directly as the src
                 alt="Profile"
                 className="w-full h-full object-cover"
               />
            ) : (
              // Fallback or handle if it were ever a file path (less likely now)
              <img
                src={`http://localhost:5001${profilePicURL}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            // Display placeholder if no image
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea className="w-full border rounded p-2" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <label className="block font-medium mb-1">Account Name</label>
        <input className="w-full border rounded p-2" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
      </div>

      <div>
        <label className="block font-medium mb-1">Email</label>
        <input className="w-full border rounded p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <p className="text-red-500 text-xs">{!validEmail && email ? "Invalid email address." : ""}</p>
      </div>

      <div>
        <label className="block font-medium mb-1 flex justify-between items-center">
          <span>Password</span>
          <button
            type="button"
            className="text-sm text-blue-600"
            onClick={() => setChangePasswordMode(prev => !prev)}
          >
            {changePasswordMode ? "Cancel" : "Change Password"}
          </button>
        </label>

        {changePasswordMode && (
          // ✅ Password Change Form
          <div className="space-y-3 mt-2">
            {/* Old Password */}
            <div>
              <input
                className="w-full border rounded p-2"
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            {/* New Password */}
            <div>
              <input
                className="w-full border rounded p-2"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {/* Password Requirements */}
              <p className="text-red-500 text-xs">
                {newPassword && !validNewPassword
                ? "8-24 chars, 1 upper, 1 lower, 1 number, 1 symbol"
                : ""}
              </p>
            </div>
            </div>
            )}
          </div>

      <div>
        <label className="block font-medium mb-1">Theme</label>
        <select className="w-full border rounded p-2" value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="adaptive">Adaptive</option>
        </select>
      </div>

      <div className="flex items-center justify-between border p-3 rounded text-left">
        <span>Enable Notification Sounds</span>
        <input
          type="checkbox"
          checked={audioNotification}
         onChange={() => setAudioNotification(!audioNotification)}
          className="h-5 w-5 appearance-none border-2 border-gray-400 rounded bg-gray-800 checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
        />
      </div>

      <div className="flex justify-between mt-6">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={handleSave}>
          Save Settings
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;