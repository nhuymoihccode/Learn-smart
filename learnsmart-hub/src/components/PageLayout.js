import { Box, Typography, Card, CardContent } from "@mui/material";

const PageLayout = ({ title, children }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h3"
        gutterBottom
        style={{ color: "#212121", textAlign: "center" }}
      >
        {title}
      </Typography>
      <Card sx={{ boxShadow: 3, borderRadius: 2, maxWidth: title === "Đăng nhập" ? 400 : "auto", mx: "auto" }}>
        <CardContent>{children}</CardContent>
      </Card>
    </Box>
  );
};

export default PageLayout;