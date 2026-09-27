import React from "react";
import { useParams } from "react-router-dom";

import LiveDeliveryMap from "../components/LiveDeliveryMap";

const DeliveryTracking = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      <div className="mx-auto max-w-6xl">

        <div className="mb-6">

          <h1 className="text-3xl font-bold">
            Delivery Tracking
          </h1>

          <p className="mt-2 text-gray-500">
            Order #{orderId}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">

          <LiveDeliveryMap
            orderId={orderId}
            isDriver={true}
          />

        </div>

      </div>

    </div>
  );
};

export default DeliveryTracking;