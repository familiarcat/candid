import React from 'react';

type DashboardCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-lcars-peach text-black p-md rounded-xl shadow-md">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-3xl">{value}</p>
      {description && <p className="text-sm text-gray-700">{description}</p>}
    </div>
  );
};

export default DashboardCard;
