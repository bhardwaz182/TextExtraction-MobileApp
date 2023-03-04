import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ToastAndroid, Button } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import RNTextDetector from 'rn-text-detector';
import { PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob'

const App = () => {
  const [responseCamera, setResponseCamera] = React.useState(null);
  const [responseGallery, setResponseGallery] = React.useState(null);
  const [image, setImage] = React.useState(null);
  const [text, setText] = React.useState(null);

  const pickImage = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 200,
        maxWidth: 200,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage);
        } else if (response.customButton) {
          console.log("User tapped custom button: ", response.customButton);
        } else {
          console.log("response in image picker", response.assets[0].uri);
          setImage(response.assets[0].uri);
        }
      }
    );
  };

  const detectText = async () => {
    console.log("image in detect text", image);
    if (image) {
      try {
        const result = await RNTextDetector.detectFromUri(image);
        console.log("result in text recog", result);
        const resultString = result.map((res) => res.text.split(" ").join(",")).join(",");
        setText(resultString);
        console.log("result in text recog", resultString);
      } catch (error) {
        console.log(error);
      }
    } else {
      ToastAndroid.show("Please select an image", ToastAndroid.SHORT);
      // <Text>Please select an image</Text>
    }
  };


  const openCameraWithPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'App Camera Permission',
          message: 'App needs access to your camera ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        ImagePicker.launchCamera(
          {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 200,
            maxWidth: 200,
          },
          (response) => {
            console.log(response);
            setResponseCamera(response);
            setResponseGallery(null);
          },
        );
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  console.log("responseCamera", responseCamera);

  const takePhotoFromCamera = () => {
    ImagePicker.launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 200,
        maxWidth: 200,
      },
      (response) => {
        console.log("response in camera", response);
        setImage(response.assets[0].uri);
      },
    );
  };

  const processAndSaveText = (ocrText) => {
    const csvText = unparse(ocrText);
    saveToFile(csvText);
  }

  const saveToFile = async (text) => {
      const filePath = `${RNFS.DocumentDirectoryPath}/matrix.csv`;
      console.log("file path", filePath);
      RNFS.writeFile(filePath, text, 'utf8')
          .then(success => console.log('File created'))
          .catch(err => console.log(err.message));

          try {
            console.log("in try");
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permission granted");

                const fs = RNFetchBlob.fs;
                // const base64 = RNFetchBlob.base64;

                const dirs = RNFetchBlob.fs.dirs;
                console.log(dirs.DownloadDir);

                const NEW_FILE_PATH = dirs.DownloadDir + '/matrix.csv';
                fs.writeFile(NEW_FILE_PATH, text, 'utf8');
                ToastAndroid.show(`File saved sucessfully to ${NEW_FILE_PATH}`, ToastAndroid.LONG);

            } else {
                console.log('Permission denied');
            }
            } catch (err) {
                console.warn(err);
            }
  }

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        // justifyContent: 'space-around',
        // alignItems: 'center',
        marginTop: 250,
        marginLeft: 150,
      }}>
      {/* <TouchableOpacity onPress={() => openCameraWithPermission()}>
        {responseCamera === null ? (
          <Text>Camera</Text>
        ) : (
          // <Image style={styles.icon} source={{uri: responseCamera.uri}} />
          <Text>CAMERA</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          ImagePicker.launchImageLibrary(
            {
              mediaType: 'photo',
              includeBase64: false,
              maxHeight: 200,
              maxWidth: 200,
            },
            (response) => {
              setResponseGallery(response);
              setResponseCamera(null);
            },
          )
        }>
        {responseGallery === null ? (
          <Text>Gallery</Text>
        ) : (
          <Image style={styles.icon} source={{uri: responseGallery.uri}} />
        )}
      </TouchableOpacity> */}
      <View >
        <Text >Text Detector</Text>
        <Button title="Take Photo" onPress={takePhotoFromCamera} style={{margin:10}}/>
        <Button title="Pick Image" onPress={pickImage} style={{margin:5}}/>
        <Button title="Detect Text" onPress={detectText} style={{margin:5}}/>
        <Button title="Save Text" onPress={()=>saveToFile(text)} style={{margin:5}}/>
        {image && (
          <Image source={{ uri: image }} />
        )}
        {text && (
          <Text style={{ marginTop: 20, fontSize: 20, fontWeight: "bold" }}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    height: 50,
    width: 50,
  },
});

export default App;

