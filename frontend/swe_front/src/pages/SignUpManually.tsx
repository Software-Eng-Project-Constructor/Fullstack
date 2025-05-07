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

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [validNewPassword, setValidNewPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profilePicURL, setProfilePicURL] = useState<string>("");
  const [theme, setTheme] = useState("adaptive");
  const [audioNotification, setAudioNotification] = useState(true);

  const [validEmail, setValidEmail] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get<UserPayload>(
          "http://localhost:5001/api/users/me/full",
          { withCredentials: true }
        );

        console.log("DEBUG: /me/full response", res.data);

        const user = res.data;
        setAccountName(user.name || "");
        setEmail(user.email || "");
        setDescription(user.description || "");
        setTheme(user.theme || "adaptive");
        setAudioNotification(user.audioNotification ?? true);

        if (user.profilePicPath) {
          console.log("DEBUG: Received profilePicPath →", user.profilePicPath);
          setProfilePicURL(user.profilePicPath);
        } else {
          console.warn("DEBUG: No profilePicPath received, setting empty");
          setProfilePicURL("");
        }
      } catch (err) {
        console.error("DEBUG: Failed to load user data", err);
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

    if (
      !validEmail ||
      (changePasswordMode && (!oldPassword || !validNewPassword))
    ) {
      setErrorMsg("Please enter a valid email and password.");
      errRef.current?.focus();
      return;
    }

    let profilePicBase64: string | null = null;
    if (profilePic) {
      console.log("DEBUG: Converting selected file to Base64");
      profilePicBase64 = await fileToBase64(profilePic);
    }

    try {
      console.log("DEBUG: Updating general settings");
      await axios.post(
        "http://localhost:5001/api/users/update-settings",
        {
          name: accountName,
          email,
          description,
          theme,
          audioNotification,
        },
        { withCredentials: true }
      );

      if (changePasswordMode) {
        console.log("DEBUG: Updating password");
        await axios.post(
          "http://localhost:5001/api/users/update-password",
          { oldPassword, newPassword },
          { withCredentials: true }
        );
        setOldPassword("");
        setNewPassword("");
        setChangePasswordMode(false);
      }

      if (profilePicBase64) {
        console.log("DEBUG: Uploading profile picture");
        await axios.post(
          "http://localhost:5001/api/users/update-picture",
          { base64Image: profilePicBase64 },
          { withCredentials: true }
        );
      }

      const res = await axios.get<UserPayload>(
        "http://localhost:5001/api/users/me/full",
        { withCredentials: true }
      );

      console.log("DEBUG: Refetched /me/full after save →", res.data);

      if (res.data.profilePicPath) {
        console.log(
          "DEBUG: Updating profilePicURL after save →",
          res.data.profilePicPath
        );
        setProfilePicURL(res.data.profilePicPath);
      } else {
        console.warn("DEBUG: No profilePicPath returned after save");
        setProfilePicURL("");
      }

      setSuccessMsg("Settings saved successfully!");
    } catch (err: any) {
      console.error("DEBUG: Save failed", err);
      setErrorMsg(err?.response?.data?.message || "Failed to save settings.");
      errRef.current?.focus();
    }
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This is irreversible."
      )
    ) {
      // Call delete API here
    }
  };

  return (
    <div className="p-4 pl-12 w-full max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}
      <p ref={errRef} className="text-red-500 text-sm h-5">
        {errorMsg}
      </p>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full overflow-hidden">
          {profilePic ? (
            <img
              src={URL.createObjectURL(profilePic)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : profilePicURL ? (
            profilePicURL.startsWith("data:image/") ? (
              (console.log("DEBUG: Rendering BASE64 image"),
              (
                <img
                  src={profilePicURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ))
            ) : (
              (console.log(
                "DEBUG: Rendering server image →",
                `http://localhost:5001${profilePicURL}`
              ),
              (
                <img
                  src={`http://localhost:5001${profilePicURL}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ))
            )
          ) : (
            (console.warn("DEBUG: No image to display (placeholder shown)"),
            (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                No Image
              </div>
            ))
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
        <textarea
          className="w-full border rounded p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Account Name</label>
        <input
          className="w-full border rounded p-2"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Email</label>
        <input
          className="w-full border rounded p-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="text-red-500 text-xs">
          {!validEmail && email ? "Enter a valid email address." : ""}
        </p>
      </div>

      <div>
        <label className="block font-medium mb-1 flex justify-between items-center">
          <span>Password</span>
          <button
            type="button"
            className="text-sm text-blue-600"
            onClick={() => setChangePasswordMode((prev) => !prev)}
          >
            {changePasswordMode ? "Cancel" : "Change Password"}
          </button>
        </label>

        {changePasswordMode && (
          <div className="space-y-3 mt-2">
            <div>
              <input
                className="w-full border rounded p-2"
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className="relative">
              <input
                className="w-full border rounded p-2 pr-16"
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-4 flex items-center text-sm text-gray-600 hover:text-black"
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
              <p className="text-red-500 text-xs">
                {newPassword && !validNewPassword
                  ? "Must be 8-24 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char."
                  : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">Theme</label>
        <select
          className="w-full border rounded p-2"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
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
        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
            (!validEmail || (changePasswordMode && !validNewPassword)) &&
            "opacity-50 cursor-not-allowed"
          }`}
          onClick={handleSave}
          disabled={!validEmail || (changePasswordMode && !validNewPassword)}
        >
          Save Settings
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;
