import React from "react";
import Title from "../../components/Title";

const ListBookings = () => {
  return (
    <>
      <Title text1="List" text2="Bookings" />
      <p className="mt-8 text-gray-400 max-w-lg">
        Booking records will appear here once you connect payments and persist bookings to the database. Checkout
        currently saves tickets locally under My Bookings for the signed-in experience.
      </p>
    </>
  );
};

export default ListBookings;
