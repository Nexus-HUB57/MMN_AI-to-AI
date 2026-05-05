export const getSessionCookieOptions = (req: any) => {
  return {
    httpOnly: true,
    secure: req.protocol === "https",
    sameSite: "lax" as const,
    path: "/",
  };
};
