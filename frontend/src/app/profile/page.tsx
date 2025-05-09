"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Profile } from '../models/profile';
import NavBar from '../components/NavBar';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { PasswordReset } from '../models/auth';
import { resetUserPassword } from '../services/authService';
import BankIntegration from '../components/PlaidIntegration/BankIntegration';
import { usePlaid } from '../hooks/usePlaid';
import PlaidLinkWrapper from '../components/PlaidIntegration/PlaidLinkWrapper';
import PlaidDisconnect from '../components/PlaidIntegration/PlaidDisconnect';

const ProfilePage = () => {


  const [profile, setProfile] = useState<Profile>(
    {
      id: "0",
      name: "John Doe",
      email: ""
    }
  );

  const { plaidAccessToken, exchangePublicToken, disconnectBank } = usePlaid();
  const isBankConnected = useMemo(() => !!plaidAccessToken, [plaidAccessToken]);

  console.log(isBankConnected)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [passwordReset, setPasswordReset] = useState<PasswordReset>({
    email: profile.email,
    newPassword: "************",
    confirmNewPassword: ""
  });
  const [response, setResponse] = useState<{ success: boolean; message?: string } | undefined>(undefined);

  useEffect(() => {
    const userID: string = localStorage.getItem('userId') || "0";
    const name: string = localStorage.getItem('user') || "John Doe";
    const email: string = localStorage.getItem('email') || "";

    setProfile({
      id: userID,
      name: name,
      email: email
    });
    setPasswordReset({
      email: email,
      newPassword: "************",
      confirmNewPassword: ""
    });
  }, []);

  const handleEditClick = () => {
    if (isEditing) {
      handleSaveClick();
    } else {
      setPasswordReset({
        ...passwordReset,
        newPassword: "",
        confirmNewPassword: ""
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveClick = async () => {
    const res = await resetUserPassword(localStorage.getItem('accessToken') || "", passwordReset);
    setResponse(res);
    setPasswordReset({
      email: profile.email,
      newPassword: "*********",
      confirmNewPassword: "**********"
    });
  };

  const handlePasswordChange = (value: string): void => {
    setPasswordReset({
      ...passwordReset,
      newPassword: value,
      confirmNewPassword: value
    });
  }

  interface Response {
    success: boolean;
    message?: string;
  }

    const handlePlaidSuccess = useCallback(async (publicToken: string) => {
      try {
          await exchangePublicToken(publicToken);
          // await updateTransactions();
          // setContentKey((prevKey) => prevKey + 1);
      } catch (error) {
          console.error("Error exchanging public token:", error);
      }
  }, [exchangePublicToken]);

  return (
    <div className="flex bg-[#F1F5F9] min-h-screen w-full">
      <NavBar />
      <div className="w-full lg:ml-[5%] lg:w-3/4 p-4 pt-[5%] flex flex-col gap-4">
        <TextField
          id="name"
          label="Name"
          value={profile.name}
          disabled
        />
        <TextField
          id="email"
          label="Email"
          value={profile.email}
          disabled
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          value={passwordReset.newPassword}
          onChange={(e) => handlePasswordChange(e.target.value)}
          disabled={!isEditing}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  onClick={handleEditClick}
                  edge='end'
                >
                  {isEditing ? <SaveIcon /> : <EditIcon />}
                </IconButton>
              </InputAdornment>
            )
          }} />
          {!isBankConnected ? <PlaidLinkWrapper onSuccess={handlePlaidSuccess} /> : <PlaidDisconnect onDisconnect={disconnectBank}/>}
        <p style={{ color: response?.success ? "green" : "red" }}>{response?.message}</p>
      </div>
    </div>
  );
};

export default ProfilePage;

