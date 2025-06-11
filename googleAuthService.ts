oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [...],
  state: userId,
  redirect_uri: 'https://barber-booker-boweazy123.replit.app/auth/google/callback'
});