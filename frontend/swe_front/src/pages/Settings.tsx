import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ThemeType, useTheme } from "../context/ThemeContext"; // Import ThemeContext

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
  const { theme, setTheme } = useTheme(); // Use the theme context

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [validNewPassword, setValidNewPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profilePicURL, setProfilePicURL] = useState<string>("");

  const [audioNotification, setAudioNotification] = useState(true);

  const [validEmail, setValidEmail] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get<UserPayload>(
          "http://localhost:5001/api/users/me/full"
        );
        const user = res.data;
        setAccountName(user.name || "");
        setEmail(user.email || "");
        setDescription(user.description || "");
        // Set theme from the context, not from the user data directly
        if (user.theme) {
          setTheme(user.theme as ThemeType);
        }
        setAudioNotification(user.audioNotification ?? true);
        setProfilePicURL(user.profilePicPath || "");
      } catch (err) {
        setErrorMsg("Failed to load user data.");
        errRef.current?.focus();
      }
    };
    fetchUser();
  }, [setTheme]);

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
      profilePicBase64 = await fileToBase64(profilePic);
    }

    try {
      // Save settings to server
      await axios.post("http://localhost:5001/api/users/update-settings", {
        name: accountName,
        email,
        description,
        theme, // Just pass the theme from the context
        audioNotification,
      });

      if (changePasswordMode) {
        await axios.post("http://localhost:5001/api/users/update-password", {
          oldPassword,
          newPassword,
        });
        setOldPassword("");
        setNewPassword("");
        setChangePasswordMode(false);
      }

      if (profilePicBase64) {
        await axios.post("http://localhost:5001/api/users/update-picture", {
          base64Image: profilePicBase64,
        });
      }

      const res = await axios.get<UserPayload>(
        "http://localhost:5001/api/users/me/full"
      );
      setProfilePicURL(res.data.profilePicPath || "");
      setSuccessMsg("Settings saved successfully!");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to save settings.");
      errRef.current?.focus();
    }
  };

  // Handle theme change from dropdown
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as ThemeType;
    setTheme(newTheme); // Use the context's setTheme
  };

  return (
    <div
      className="p-5 my-5 max-w-5xl mx-auto space-y-6 rounded-xl"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      <h1 className="text-3xl font-bold">Settings</h1>

      {successMsg && (
        <p className="text-green-400 bg-green-900/20 p-2 rounded text-sm">
          {successMsg}
        </p>
      )}
      <p ref={errRef} className="text-red-400 text-sm h-5">
        {errorMsg}
      </p>

      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 shadow-inner">
          {profilePic ? (
            <img
              src={URL.createObjectURL(profilePic)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : profilePicURL ? (
            profilePicURL.startsWith("data:image/") ? (
              <img
                src={profilePicURL}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={`http://localhost:5001${profilePicURL}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Upload New Picture</label>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="w-full rounded p-2 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: theme === "light" ? "#f1f5f9" : "var(--card-bg)",
              borderColor:
                theme === "light" ? "#cbd5e1" : "var(--border-color)",
              color: theme === "light" ? "#0f172a" : "var(--text-color)",
            }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Account Name</label>
          <input
            className="w-full rounded p-2 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: theme === "light" ? "#f1f5f9" : "var(--card-bg)",
              borderColor:
                theme === "light" ? "#cbd5e1" : "var(--border-color)",
              color: theme === "light" ? "#0f172a" : "var(--text-color)",
            }}
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email Address</label>
          <input
            type="email"
            className="w-full rounded p-2 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: theme === "light" ? "#f1f5f9" : "var(--card-bg)",
              borderColor:
                theme === "light" ? "#cbd5e1" : "var(--border-color)",
              color: theme === "light" ? "#0f172a" : "var(--text-color)",
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-red-400 text-xs mt-1">
            {!validEmail && email ? "Enter a valid email address." : ""}
          </p>
        </div>

        <div
          className="border-t pt-4"
          style={{ borderColor: "var(--border-color)" }}
        >
          <label className="block font-medium mb-1">
            <span>Password</span>
            <button
              type="button"
              className="text-sm text-blue-400 hover:underline ml-3"
              onClick={() => setChangePasswordMode((prev) => !prev)}
            >
              {changePasswordMode ? "Cancel" : "Change Password"}
            </button>
          </label>

          {changePasswordMode && (
            <div className="space-y-3 mt-2">
              <input
                className="w-full rounded p-2 focus:outline-none focus:ring-2"
                type="password"
                placeholder="Old Password"
                style={{
                  backgroundColor:
                    theme === "light" ? "#f1f5f9" : "var(--card-bg)",
                  borderColor:
                    theme === "light" ? "#cbd5e1" : "var(--border-color)",
                  color: theme === "light" ? "#0f172a" : "var(--text-color)",
                }}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <div className="relative">
                <input
                  className="w-full rounded p-2 pr-20 focus:outline-none focus:ring-2"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  style={{
                    backgroundColor:
                      theme === "light" ? "#f1f5f9" : "var(--card-bg)",
                    borderColor:
                      theme === "light" ? "#cbd5e1" : "var(--border-color)",
                    color: theme === "light" ? "#0f172a" : "var(--text-color)",
                  }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 text-sm hover:text-[var(--primary-color-hover)]"
                  style={{ color: "var(--muted-text-color)" }}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-red-400 text-xs mt-1">
                {newPassword && !validNewPassword
                  ? "Must be 8-24 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char."
                  : ""}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Theme</label>
          <select
            className="w-full rounded p-2 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: theme === "light" ? "#f1f5f9" : "var(--card-bg)",
              borderColor:
                theme === "light" ? "#cbd5e1" : "var(--border-color)",
              color: theme === "light" ? "#0f172a" : "var(--text-color)",
            }}
            value={theme}
            onChange={handleThemeChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="adaptive">Adaptive</option>
          </select>
        </div>

        <div
          className="flex items-center justify-between rounded p-3 border"
          style={{
            backgroundColor: theme === "light" ? "#f1f5f9" : "var(--card-bg)",
            borderColor: theme === "light" ? "#cbd5e1" : "var(--border-color)",
            color: theme === "light" ? "#0f172a" : "var(--text-color)",
          }}
        >
          <span>Enable Notification Sounds</span>
          <input
            type="checkbox"
            checked={audioNotification}
            onChange={() => setAudioNotification(!audioNotification)}
            className="h-5 w-5 rounded border-gray-500 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          className={`px-4 py-2 rounded-lg font-semibold text-white focus:ring-2`}
          style={{
            backgroundColor:
              theme === "light" ? "#3b82f6" : "var(--primary-color)",
            color: "white",
            opacity:
              !validEmail || (changePasswordMode && !validNewPassword)
                ? 0.5
                : 1,
            cursor:
              !validEmail || (changePasswordMode && !validNewPassword)
                ? "not-allowed"
                : "pointer",
          }}
          onClick={handleSave}
          disabled={!validEmail || (changePasswordMode && !validNewPassword)}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
