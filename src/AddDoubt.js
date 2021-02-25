/** ********************************************************************************************
 * File: AddDoubt
 * Created By: Priyanka Suryawanshi
 * Created On: 25/02/2021
 ********************************************************************************************* */

import React, {Component} from 'react';
import {StyleSheet, Text, View,TextInput,Button,ToastAndroid,TouchableOpacity,ActivityIndicator,Image} from 'react-native';
import { RNS3 } from 'react-native-aws3';
import ImagePicker from 'react-native-image-picker';

const Subjects = ['Physics','Chemistry','Maths']; 

const imagePickerOptions = {
  title: 'Select Image',
  storageOptions: {
      skipBackup: true,
      path: 'images',
  },
  maxWidth: 1000,
  maxHeight: 1000,
  quality: 0.8,
  mediaType: 'photo',
  chooseFromLibraryButtonTitle: 'Select From Gallery...',
  tintColor: 'red'
};

const options = {
  keyPrefix: "",
  bucket: "codeage",
  region: "us-east-2",
  accessKey: "AKIAQEAFREHKRWNXWDQH",
  secretKey: "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",
  successActionStatus: 201
}

export default class AddDoubt extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      doubtText: this.props.navigation.getParam("doubtTitle")?(this.props.navigation.getParam("doubtTitle")):'',
      doubtSubject: this.props.navigation.getParam("doubtSubject")?(this.props.navigation.getParam("doubtSubject")):'',
      doubtImageUrl: this.props.navigation.getParam("doubtImage")?(this.props.navigation.getParam("doubtImage")):'',
      isLoading: false
    }
  }

  static navigationOptions = ({navigation}) => ({
    // Title of of the header
    title: navigation.getParam("viewPage")=="edit" ? "Edit Doubt" : "Add Doubt",
    headerStyle: {
      backgroundColor: "#2B4F81"
    },
    headerRight: (<View />),
    headerTintColor: "#ffffff",
    headerTitleStyle: {
      color: "#ffffff",
      fontSize: 20,
      flex: 1,
      textAlign:'center'
    },
  });

  //API TO ADD THE DOUBT
  addDoubt = async() => {
    if(this.state.doubtText!='' || this.state.doubtImageUrl!='' && this.state.doubtSubject!=''){
      requestBody = this.state.doubtText!='' ? {"doubt_text":this.state.doubtText,"subject":this.state.doubtSubject} : {"image_path":this.state.doubtImageUrl,"subject":this.state.doubtSubject}
      try {
        await fetch('https://robust-seahorse-24.hasura.app/v1/query', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "type":"insert",
            "args":{
              "table":"codeage",
              "objects":[requestBody]
            }
          })
          });
          console.log(JSON.stringify({
            "type":"insert",
            "args":{
              "table":"codeage",
              "objects":[requestBody]
            }
          }))
          ToastAndroid.show("You have successfully added the doubt ", ToastAndroid.SHORT);
          this.props.navigation.navigate("DoubtListing")
        } catch (error) {
          console.error(error);
        }
    }
    else {
      ToastAndroid.show("Please add doubt and subject", ToastAndroid.SHORT);
    }
  }

  //API TO EDIT THE DOUBT
  editDoubt = async() => {
    if(this.state.doubtText!='' || this.state.doubtImageUrl!='' && this.state.doubtSubject!=''){
      try {
        let response = await fetch('https://robust-seahorse-24.hasura.app/v1/query', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "type":"update",
          "args":{
            "table":"codeage",
            "$set":
              {"doubt_text":this.state.doubtText,
              "image_path":this.state.doubtImageUrl,
              "subject":this.state.doubtSubject},
            "where":{"id":this.props.navigation.getParam("doubtId")}
          }
        })
        });
        ToastAndroid.show("You have successfully updated the doubt ", ToastAndroid.SHORT);
        this.props.navigation.navigate("DoubtListing")
      } catch (error) {
        console.error(error);
      }
    }
    else {
      ToastAndroid.show("Please add doubt and subject", ToastAndroid.SHORT);  
      }
  }

  selectSubject = (subject,index) =>{
    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          this.setState({doubtSubject:subject})
          // this.getDoubtsData(subject);
        }}
      >
        <View key={index} style={styles.filterOptionViewAlign}>
          <Text
            style={[
              styles.filterOptionTextAlign,
              {
                borderColor:
                  subject == this.state.doubtSubject
                    ? "#ffffff"
                    : "#2B4F81",
                backgroundColor:
                  subject == this.state.doubtSubject
                    ? "#2B4F81"
                    : "#ffffff",
                color:
                  subject == this.state.doubtSubject
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

  uploadImage = async() => {
    ImagePicker.showImagePicker(imagePickerOptions, async(response) => {
      console.log('Response = ', response);
     
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        this.setState({isLoading:true})
        // const source = { uri: response.uri };
        const fileObj = {
            uri: response.uri,
            name: response.fileName,            //add Users name and Timestamp here for uniqueness
            type: 'image/jpg'
        }
      // let awsResponse = await RNS3.put(fileObj, options);
      // console.log("awsResponse-->",awsResponse)
       RNS3.put(fileObj, options).then(response=> {
          console.log("response of s3333333-->",response)
          if (response.status == 201){
            this.setState({doubtImageUrl : response.body.postResponse.location, doubtText : '', isLoading:false})
            ToastAndroid.show("Successfully uploaded the image", ToastAndroid.SHORT);
          }
          else{
              ToastAndroid.show("Fail to upload image", ToastAndroid.SHORT);
          }
          /**
           * {
           *   postResponse: {
           *     bucket: "your-bucket",
           *     etag : "9f620878e06d28774406017480a59fd4",
           *     key: "uploads/image.png",
           *     location: "https://your-bucket.s3.amazonaws.com/uploads%2Fimage.png"
           *   }
           * }
           */
        });
        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
     
        // this.setState({
        //   avatarSource: source,
        // });
      }
    });
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
      <View style={styles.container}>
        <View style={styles.parentView}>
        <Text style={styles.enterDoubtTitle}>Enter Doubt :</Text>
        <TextInput
            mode="outlined"
            multiline={true}
            style={styles.textinputNew}
            text="#fff"
            placeholder="Doubt"
            value={this.state.doubtText}
            onChangeText={(doubtText) =>
              this.setState({ doubtText,doubtImageUrl:'' })
            }
        />
        <Text style={[styles.enterDoubtTitle,{marginTop:25,marginBottom:10,textAlign:'center'}]}>OR</Text>
        {(this.state.doubtImageUrl!='')?(
            <View style={{width: '100%', height: 50,flexDirection:'row',alignItems:'center'}}>
               <Image
                   source={{ uri: this.state.doubtImageUrl }}
                   style={styles.imageView }
               />
                <Text style={[styles.enterDoubtTitle,{marginLeft:10,backgroundColor:'#2B4F81',paddingLeft:20,paddingRight:20}]}>Image.jpg</Text> 
            </View>
        ):(null)}
        <View style={{marginTop:10}}>
          <Button
            onPress={() => this.uploadImage()}
            title="UPLOAD IMAGE"
            color="#2B4F81"
          />
        </View>
        {/* selectSubject option to choose the subject of doubt */}
        <Text style={[styles.enterDoubtTitle,{marginTop:40}]}>Choose Doubt Subject :</Text>
        <View style={styles.filterOptionParentViewAlign}>
            {Subjects.map((subject, index) => {
              return this.selectSubject(subject, index);
            })}
        </View>
        <Button
          onPress={() => this.props.navigation.getParam("viewPage")=="edit"?this.editDoubt():this.addDoubt()}
          title="SUBMIT"
          color="#2B4F81"
          accessibilityLabel="Learn more about this purple button"
        />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#4D71A3',
  },
  textinputNew: {
    width: "100%",
    height: 45,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#cdcdcd",
    paddingLeft: 15,
    alignSelf:'center',
    color:'#fff'
  },
  parentView: {
    width:'80%',
    alignSelf:'center'
  },
  enterDoubtTitle: {
    fontSize:15,
    paddingBottom:3,
    color:'#fff'
  },
  filterOptionParentViewAlign: {
    height: 50,
    flexDirection: "row",
    marginRight: 16,
    width:'100%',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:40
  },
  filterOptionViewAlign: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "space-around",
    marginRight: 8,
    marginLeft:8
  },
  filterOptionTextAlign: {
    fontSize: 13,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 10,
    paddingRight: 10,
    borderWidth: 1,
    borderRadius: 20,
    lineHeight: 18,
  },
  loaderParentView: {
    flex: 1, 
    padding: 20, 
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#4D71A3'
  },
  imageView: {
    width: 50,
    height: 50,
    borderWidth:0.5,
    borderColor:"#ffffff"
},
});
