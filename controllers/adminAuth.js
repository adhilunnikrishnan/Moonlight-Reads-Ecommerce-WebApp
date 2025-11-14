
export const adminLogin = async (req, res) => {
  console.log("adminlogin func called>>>>>>>>>>>>>>",req.body)
  try {

    const { email, password } = req.body;


    if (!email || !password) {
      return res.render("admin/adminLogin", {
        layout: "admin",
        title: "Admin Login",
        error: "Email and password are required.",
      });
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.render("admin/adminLogin", {
        layout: "admin",
        title: "Admin Login",
        error: "Invalid credentials.",
      });
    }

    // ✅ If login successful
    // req.session.admin = true;
    // req.session.adminEmail = email;

    return res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Admin login error:", error);
    return res.render("admin/adminLogin", {
      layout: "admin",
      title: "Admin Login",
      error: "Something went wrong. Please try again.",
    });
  }
};


