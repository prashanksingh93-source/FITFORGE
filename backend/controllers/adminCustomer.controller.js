import User from "../models/User.js";
import Order from "../models/Order.js";

export const getAllCustomers = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {
      role: "customer",
    };

    if (status === "blocked") {
      filter.isBlocked = true;
    }

    if (status === "active") {
      filter.isBlocked = false;
    }

    let customers = await User.find(filter)
      .select(
        "fullName email phone avatar isBlocked createdAt addresses"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    if (search?.trim()) {
      const searchText =
        search.trim().toLowerCase();

      customers = customers.filter(
        (customer) =>
          customer.fullName
            ?.toLowerCase()
            .includes(searchText) ||
          customer.email
            ?.toLowerCase()
            .includes(searchText) ||
          customer.phone
            ?.toLowerCase()
            .includes(searchText)
      );
    }

    const customerIds = customers.map(
      (customer) => customer._id
    );

    const orderStats =
      await Order.aggregate([
        {
          $match: {
            user: {
              $in: customerIds,
            },
          },
        },
        {
          $group: {
            _id: "$user",
            orderCount: {
              $sum: 1,
            },
            totalSpent: {
              $sum: {
                $cond: [
                  {
                    $ne: [
                      "$orderStatus",
                      "Cancelled",
                    ],
                  },
                  "$totalAmount",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const statsMap = new Map(
      orderStats.map((item) => [
        item._id.toString(),
        item,
      ])
    );

    customers = customers.map(
      (customer) => {
        const stats = statsMap.get(
          customer._id.toString()
        );

        return {
          ...customer,
          orderCount:
            stats?.orderCount || 0,
          totalSpent:
            stats?.totalSpent || 0,
        };
      }
    );

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error(
      "Get customers error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch customers",
    });
  }
};

export const getCustomerById = async (
  req,
  res
) => {
  try {
    const customer =
      await User.findOne({
        _id: req.params.id,
        role: "customer",
      }).select(
        "fullName email phone avatar isBlocked createdAt addresses"
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const orders = await Order.find({
      user: customer._id,
    })
      .populate(
        "items.product",
        "name images price salePrice"
      )
      .sort({
        createdAt: -1,
      });

    const totalSpent = orders.reduce(
      (total, order) => {
        if (
          order.orderStatus ===
          "Cancelled"
        ) {
          return total;
        }

        return (
          total +
          Number(order.totalAmount || 0)
        );
      },
      0
    );

    res.status(200).json({
      success: true,
      customer: {
        ...customer.toObject(),
        orderCount: orders.length,
        totalSpent,
      },
      orders,
    });
  } catch (error) {
    console.error(
      "Get customer error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer",
    });
  }
};

export const updateCustomerStatus =
  async (req, res) => {
    try {
      const { isBlocked } = req.body;

      if (
        typeof isBlocked !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isBlocked must be true or false",
        });
      }

      const customer =
        await User.findOne({
          _id: req.params.id,
          role: "customer",
        });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message:
            "Customer not found",
        });
      }

      customer.isBlocked = isBlocked;

      await customer.save();

      res.status(200).json({
        success: true,
        message: isBlocked
          ? "Customer blocked successfully"
          : "Customer unblocked successfully",
        customer: {
          id: customer._id,
          fullName:
            customer.fullName,
          email: customer.email,
          isBlocked:
            customer.isBlocked,
        },
      });
    } catch (error) {
      console.error(
        "Customer status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update customer status",
      });
    }
  };