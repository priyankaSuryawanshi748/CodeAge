import {
    createStackNavigator
  } from "react-navigation";
  import AddDoubt from "./AddDoubt";
  import DoubtListing from "./DoubtListing";
  
  const MainNavigator = createStackNavigator(
    {
        AddDoubt:AddDoubt,
        DoubtListing:DoubtListing
    },
    {
      initialRouteName: "DoubtListing"
    }
  );
export default MainNavigator;
  