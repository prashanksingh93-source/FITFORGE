import Homepage from "../models/Homepage.js";

const defaultHomepage = {
  heroTitle: "THE MOST ICONIC GYM WEAR",
  heroSubtitle: "BUILT FOR PERFORMANCE. DESIGNED FOR THE ICONIC.",
  heroDescription:
    "Premium gym wear engineered for movement, performance and everyday confidence.",
  heroImage: "",
  heroButtonText: "SHOP THE SIGNATURE COLLECTION",
  heroButtonLink: "/shop",
  announcementEnabled: true,
  announcementText: "THE MOST ICONIC GYM WEAR",
  performanceTitle: "PERFORMANCE",
  performanceSubtitle: "ENGINEERED TO PERFORM",
  luxuryTitle: "LUXURY",
  luxurySubtitle: "ELEVATED TRAINING",
  featuredTitle: "ICONIC ESSENTIALS",
  featuredSubtitle: "THE PIECES THAT DEFINE FITFORGE",
  isActive: true,
};

export const getHomepage = async (req, res) => {
  try {
    let homepage = await Homepage.findOne({
      isActive: true,
    });

    if (!homepage) {
      homepage = await Homepage.create(defaultHomepage);
    }

    res.status(200).json({
      success: true,
      homepage,
    });
  } catch (error) {
    console.error("Get homepage error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch homepage settings",
    });
  }
};

export const getAdminHomepage = async (req, res) => {
  try {
    let homepage = await Homepage.findOne();

    if (!homepage) {
      homepage = await Homepage.create(defaultHomepage);
    }

    res.status(200).json({
      success: true,
      homepage,
    });
  } catch (error) {
    console.error("Get admin homepage error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch homepage settings",
    });
  }
};

export const updateHomepage = async (req, res) => {
  try {
    let homepage = await Homepage.findOne();

    if (!homepage) {
      homepage = await Homepage.create({
        ...defaultHomepage,
        ...req.body,
      });
    } else {
      Object.assign(homepage, req.body);
      await homepage.save();
    }

    res.status(200).json({
      success: true,
      message: "Homepage updated successfully",
      homepage,
    });
  } catch (error) {
    console.error("Update homepage error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update homepage",
    });
  }
};