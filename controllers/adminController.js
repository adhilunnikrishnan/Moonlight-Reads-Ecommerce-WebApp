
export const adminLoginPage = async (req, res) => {
  res.render("admin/adminLogin", { layout: "admin", title: "Admin Login" });
};

export const adminLogout = (req, res) => {
  try {
    // Clear the token cookie on logout
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    // Redirect back to login page
    return res.redirect("/admin");
  } catch (err) {
    // console.error("Logout Error:", err.message);
    return res.redirect("/admin");
  }
};

export const adminDashboardPage = async (req, res) => {
  try {

    // Render dashboard
    res.render("admin/dashboard", {
      layout: "admin",
      title: "Admin Dashboard",
    });
  } catch (error) {
    // console.error("Error loading admin dashboard:", error);
    res.status(500).send("Something went wrong loading the dashboard.");
  }
};

export const addProductPage = async (req, res) => {
  try {

    // Render dashboard
    res.render("admin/addProduct", {
      layout: "admin",
      title: "Admin - Add Product",
    });
  } catch (error) {
    // console.error("Error loading admin dashboard:", error);
    res.status(500).send("Something went wrong loading the dashboard.");
  }
};