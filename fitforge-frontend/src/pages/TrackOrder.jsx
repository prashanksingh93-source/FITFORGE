import React from "react";
import { useParams } from "react-router-dom";

import LiveDeliveryMap from "../components/LiveDeliveryMap";

const TrackOrder = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      <div className="mx-auto max-w-6xl">

        <div className="mb-6">

          <h1 className="text-3xl font-bold">
            Track Your Order
          </h1>

          <p className="mt-2 text-gray-500">
            Order #{id}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">

          <LiveDeliveryMap
            orderId={id}
            isDriver={false}
          />

        </div>

      </div>

    </div>
  );
};

export default TrackOrder;