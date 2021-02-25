/** ********************************************************************************************
 * File: DoubtListing
 * Created By: Priyanka Suryawanshi
 * Created On: 25/02/2021
 ********************************************************************************************* */

import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground, ActivityIndicator, FlatList, ToastAndroid, StatusBar, Modal,TouchableHighlight} from 'react-native';
import { Card } from "react-native-elements";

//ADD BUTTON UI
const AddButton = () => {
  return (
    <View style={{    height: 56,
      width: 56,
      borderRadius: 400,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",backgroundColor:'#2B4F81'}}>
      <Image source={require("../assets/add_button_image.png")} style={{height: 20, width: 20}} />
    </View>
  );
}

const Subjects = ['All','Physics','Chemistry','Maths'];

export default class DoubtListing extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      listingData:'',
      isLoading: true,
      selectedFilterOption:Subjects[0],
      modalVisible: false,
      imageUrl:''
    }
  }

  static navigationOptions = () => ({
    // Title of the header
    title: "Doubts",
    headerStyle: {
      backgroundColor: "#2B4F81"
    },
    headerTitleStyle: {
      color: "#ffffff",
      fontSize: 20,
      flex: 1,
      textAlign:'center'
    },
  });

  //API TO GET ALL THE DOUBT DATA
  getDoubtsData = async(subject) => {
    await this.setState({isLoading:true,selectedFilterOption:subject})
    subjectQuery = subject!='All' ? {"subject":subject} : null
    try {
      let response = await fetch('https://robust-seahorse-24.hasura.app/v1/query', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "type":"select",
        "args":{
          "table":"codeage",
          "columns":["id","doubt_text","subject","posted_at","image_path"],
          "where":subjectQuery,
        },
      })
      });
      let responseJson = await response.json();
      this.setState({listingData: responseJson,isLoading:false})
    } catch (error) {
      console.error(error);
    }
  }

  //API TO DELETE THE DOUBT
  deleteDoubt = async(doubtId) => {
    this.setState({isLoading:true})
    try {
      let response = await fetch('https://robust-seahorse-24.hasura.app/v1/query', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "type":"delete",
        "args":{
          "table":"codeage",
          "where":{"id":doubtId}
        }
      })
      });
      ToastAndroid.show("You have successfully deleted the doubt ", ToastAndroid.SHORT);
      this.getDoubtsData(this.state.selectedFilterOption);
    } catch (error) {
      console.error(error);
    }
  }

  componentDidMount(){
    StatusBar.setBackgroundColor("#2B4F81");

    //LISTENER TO FETCH THE DATA WHEN SCREEN IS FOCUSED
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.getDoubtsData(this.state.selectedFilterOption);
    })
  }

  componentWillUnmount() {
    // REMOVE FOCUS LISTENER
    this.focusListener.remove();
  }

  filter = (subject,index) =>{
    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          this.getDoubtsData(subject);
        }}
      >
        <View key={index} style={styles.filterOptionViewAlign}>
          <Text
            style={[
              styles.filterOptionTextAlign,
              {
                borderColor:
                  subject == this.state.selectedFilterOption
                    ? "#ffffff"
                    : "#2B4F81",
                backgroundColor:
                  subject == this.state.selectedFilterOption
                    ? "#2B4F81"
                    : "#ffffff",
                color:
                  subject == this.state.selectedFilterOption
                    ? "#ffffff"
                    : "#2B4F81",
              },
            ]}
          >
            {subject}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  //THIS METHOD RENDER ALL THE FLATLIST DATA
  renderItem = ({ item }) => {
    return (
      <View style={styles.parentView}>
        <Card containerStyle={styles.cardborderradius}>
          {(item.doubt_text)?(
            <Text style={styles.cardTitleStyle}>
            {item.doubt_text}
          </Text>
          ):(null)}
          {(item.image_path)?(
            <TouchableOpacity onPress={() => {this.setState({imageUrl:item.image_path,modalVisible:true})}}>
              <Image
                source={{ uri: item.image_path }}
                style={{height:200,width:"100%"}}
                resizeMode={'stretch'}
              />
            </TouchableOpacity>
          ):(null)}
          <View
            style={{
              borderBottomColor: '#ffff',
              borderBottomWidth: 0.3,
              margin:10
            }}
          />
          <Text style={styles.whiteColor}>
            SUBJECT : {item.subject}
          </Text>
          <View style={styles.align}>
            <View style={styles.postedByViewStyle}>
              <Text style={styles.whiteColor}>POSTED_ON : {item.posted_at}</Text>
            </View>
            <View style={styles.imageContainer}>
              <TouchableOpacity style={styles.paddingRight}
                onPress={() => this.props.navigation.navigate("AddDoubt",{viewPage : "edit",doubtId: item.id,doubtTitle:item.doubt_text,doubtSubject: item.subject,doubtImage:item.image_path})
              }>
                <Image source={require("../assets/edit.png")} />
              </TouchableOpacity >
              <TouchableOpacity  
                onPress={() => this.deleteDoubt(item.id)
              }>
                <Image source={require("../assets/delete.png")} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  viewImage = () =>{
    return(
      <Modal transparent={true}
        visible={this.state.modalVisible}
      >
        <View style={{height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
          <View style={styles.modal}>
            <ImageBackground
              style={{ width: '100%', height: '100%'}}
              source={{ uri: this.state.imageUrl }}
              resizeMode={'stretch'}
            >
              <TouchableOpacity
                      onPress={() => {
                        this.setState({ modalVisible: false });
                      }}
                      style={styles.closeButton}
                    >
                      <Image
                        style={styles.cancelAlign}
                        source={require('../assets/cancel_white_image.png')}
                      />
              </TouchableOpacity>
            </ImageBackground>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    if(this.state.isLoading){
      return(
        <View style={styles.loaderParentView}>
          <ActivityIndicator 
              size='small' 
              color={"#fff"}
          />
        </View>
      )
    }
    return (
      <View style={styles.addButtonView}>
        {/* filter option to display the doubts according to subject preference */}
        <View style={styles.filterOptionParentViewAlign}>
          {Subjects.map((subject, index) => {
            return this.filter(subject, index);
          })}
        </View>
        {(this.state.listingData.length<=0)?(
          <View style={styles.container}>
            <Text style={styles.addText}>
              Data not found
            </Text>
          </View>
        ):(
          <View style={{flex:1}}>
            <FlatList
              data={this.state.listingData}
              renderItem={this.renderItem}
              extraData={this.state.listingData}
            />
          </View>
        )}
        <TouchableOpacity
          style={styles.floatingButtonStyle}
          onPress={() => this.props.navigation.navigate("AddDoubt",{viewPage : "add"})
        }>
          <AddButton ButtonColor="#FF0000" />
        </TouchableOpacity>
        {this.viewImage()}
      </View>
    );  
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4D71A3",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    color: "#fff",
    fontSize: 15,
    backgroundColor:'#2B4F81',
    padding:15,
    borderRadius:10,
    borderWidth:0.5,
    borderColor:'#ffffff'
  },
  addButtonView: {
    flex: 1,
    backgroundColor: "#4D71A3"
  },
  parentView: {
    backgroundColor: "#4D71A3",
    flex:1
  },
  cardborderradius: {
    borderRadius: 10,
    backgroundColor:'#2B4F81'
  },
  floatingButtonStyle: {
    position: "absolute",
    width: "15%",
    height: "10%",
    alignItems: "center",
    justifyContent: "center",
    right: "2%",
    bottom: "1%",
  },
  cardTitleStyle: {
    color:"#fff",
    fontSize:16,
    textAlign:'left'
  },
  align: {
    flex:1,
    flexDirection:'row'
  },
  postedByViewStyle: {
    flex:3,
    alignSelf:'flex-end'
  },
  whiteColor: {color:'#fff'},
  imageContainer: {
    flex:1,
    flexDirection:'row',
    justifyContent:'flex-end',
    alignItems:'center'
  },
  paddingRight: {paddingRight:10},
  loaderParentView: {
    flex: 1, 
    padding: 20, 
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#4D71A3'
  },
  filterOptionParentViewAlign: {
    height: 50,
    flexDirection: "row",
    marginTop: 13,
    marginRight: 16,
    width:'100%',
    alignItems:'center',
    justifyContent:'center'
  },
  filterOptionViewAlign: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "space-around",
    marginRight: 8,
    marginLeft:8
  },
  filterOptionTextAlign: {
    fontSize: 15,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 10,
    paddingRight: 10,
    borderWidth: 1,
    borderRadius: 20,
    lineHeight: 18,
  },
  modal: {
    height:"60%",
    width:"80%",
    backgroundColor: '#2196f3',
    borderWidth:1,
    borderColor:'#ffffff'
  },
  closeButton: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginRight: 10,
    marginTop: 10
  },
  cancelAlign: {
    height: 20,
    width: 20,
    backgroundColor:'#2B4F81'
  },
});
