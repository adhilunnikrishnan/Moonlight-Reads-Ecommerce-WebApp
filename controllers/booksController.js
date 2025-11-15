export const editBookDetailsPage = async (req, res) => {
  console.log(">>>>>>>>>>>detailofBook");
  try {
    // Render dashboard
    res.render("admin/addBook", {
      layout: "admin",
      title: "Admin - Add Book",
    });
  } catch (error) {
    // console.error("Error loading admin dashboard:", error);
    res.status(500).send("Something went wrong loading the dashboard.");
  }
};

export const editBookDetails = async (req, res) => {
  console.log(">>>>>>>>>>>editBookDetails", req.body);
  try {
  } catch (error) {}
};
