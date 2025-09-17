import React from 'react';
import {
  PepperIcon,
  CarrotIcon,
  ChickenDrumstickIcon,
  SteakIcon,
  MilkCartonIcon,
  BreadLoafIcon,
} from './icons/FoodIcons';

const FoodDecorations: React.FC = () => {
  const iconBaseClasses = "absolute text-amber-200/60 hidden xl:block -z-10";

  return (
    <div aria-hidden="true">
      <PepperIcon className={`${iconBaseClasses} w-24 h-24 top-48 left-12 transform -rotate-12`} />
      <CarrotIcon className={`${iconBaseClasses} w-20 h-20 top-3/4 left-24 transform rotate-20`} />
      <ChickenDrumstickIcon className={`${iconBaseClasses} w-24 h-24 top-40 right-16 transform rotate-12`} />
      <SteakIcon className={`${iconBaseClasses} w-28 h-28 top-2/3 right-24 transform -rotate-12`} />
      <MilkCartonIcon className={`${iconBaseClasses} w-20 h-20 bottom-16 left-8 transform rotate-6`} />
      <BreadLoafIcon className={`${iconBaseClasses} w-32 h-32 bottom-24 right-12 transform -rotate-6`} />
    </div>
  );
};

export default FoodDecorations;
