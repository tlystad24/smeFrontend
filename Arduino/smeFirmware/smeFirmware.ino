/*
    Smart Everything all-in-one test program
    
    Written by Victor Pecanins (vpecanins at gmail dot com)
    
    Reads sensors and sends the values through serial port
    in JSON format

    Based on public examples by AmelTech
    https://github.com/ameltech 
 */

#include <Arduino.h>
#include <Wire.h>

#include <LSM9DS1.h> // Gyroscope,Accelerometer,Magnetometer
#include <HTS221.h>  // Humidity
#include <LPS25H.h>  // Pressure
#include <VL6180.h>  // Light light
#include <sl868a.h>  // GPS

#include <SmeNfc.h>


#define SME_2_1         "SmartEverything"
#define WEB             "amel-tech.com"
#define FEATURE_READY   "Feature Supported: NFC, SigFox, GPS, Arduino IDE"

bool nfcOk;
bool readNFC;
byte buffer[NFC_PAGE_SIZE];

String inputString = "";         // a string to hold incoming data
boolean stringComplete = false;  // whether the string is complete

bool enableGyroscope = true;
bool enableAccelerometer = true;
bool enableMagnetic = true;
bool enablePressure = true;
bool enableHumidity = true;
bool enableLight = true;
bool enableProximity = true;
bool enableGPS = true;

// the setup function runs once when you press reset or power the board
void setup() {
    smeGyroscope.begin();
    smeAccelerometer.begin();
    smeMagnetic.begin();
    smeHumidity.begin();
    smePressure.begin();
    smeAmbient.begin();
    smeProximity.begin();
    smeGps.begin();
    
    SerialUSB.begin(115200);
    inputString.reserve(200);
    setupNFC();
}

void printAxis(int x, int y, int z) {
    SerialUSB.print("[");
    SerialUSB.print(x, DEC);
    SerialUSB.print(", ");
    SerialUSB.print(y, DEC);
    SerialUSB.print(", ");
    SerialUSB.print(z, DEC);
    SerialUSB.print("]");
}



void printGPS() {
  SerialUSB.print("\"GPS\": {");
  SerialUSB.print("\"Locked\": ");
  if (smeGps.ready()) {
    SerialUSB.print("true,");
  } else {
    SerialUSB.print("false,");
  }
  SerialUSB.print("\"Altitude\": ");
  SerialUSB.print(smeGps.getAltitude(), DEC);
  SerialUSB.print(",\"Latitude\": ");
  SerialUSB.print(smeGps.getLatitude(), 6);
  SerialUSB.print(",\"Longitude\": ");
  SerialUSB.print(smeGps.getLongitude(), 6);
  SerialUSB.print(",\"LockedSatellites\": ");
  SerialUSB.print(smeGps.getLockedSatellites(), DEC);
  SerialUSB.print("}");
}

// the loop function runs over and over again forever
void loop() {
    serialEvent();

    
    SerialUSB.println("{");
    
    // Process command
    if (stringComplete) {
      ledGreenLight(HIGH);
      SerialUSB.println("\"CommandOK\": \"" + inputString + "\",");

      if (inputString=="readNFC") {
        readNFC=true;
      }

      if (inputString=="enableAccelerometer") enableAccelerometer=true;
      if (inputString=="disableAccelerometer") enableAccelerometer=false;
      if (inputString=="enableMagnetic") enableMagnetic=true;
      if (inputString=="disableMagnetic") enableMagnetic=false;
      if (inputString=="enableGyroscope") enableGyroscope=true;
      if (inputString=="disableGyroscope") enableGyroscope=false;
      if (inputString=="enableProximity") enableProximity=true;
      if (inputString=="disableProximity") enableProximity=false;
      if (inputString=="enableHumidity") enableHumidity=true;
      if (inputString=="disableHumidity") enableHumidity=false;
      if (inputString=="enableLight") enableLight=true;
      if (inputString=="disableLight") enableLight=false;
      if (inputString=="enablePressure") enablePressure=true;
      if (inputString=="disablePressure") enablePressure=false;
      if (inputString=="enableGPS") enableGPS=true;
      if (inputString=="disableGPS") enableGPS=false;
      
      // clear the string:
      delay(100);
      inputString = "";
      stringComplete = false;
      ledGreenLight(LOW);
    }

    ledBlueLight(HIGH);

    if (enableGyroscope) {
      SerialUSB.print("\"Gyroscope\": ");
      printAxis(smeGyroscope.readX(), smeGyroscope.readY(), smeGyroscope.readZ());
      SerialUSB.println(",");
    }

    if (enableAccelerometer) {
      SerialUSB.print("\"Accelerometer\": ");
      printAxis(smeAccelerometer.readX(), smeAccelerometer.readY(), smeAccelerometer.readZ());
      SerialUSB.println(",");
    }

    if (enableMagnetic) {
      SerialUSB.print("\"Magnetic\": ");
      printAxis(smeMagnetic.readX(), smeMagnetic.readY(), smeMagnetic.readZ());
      SerialUSB.println(",");
    }
    
    int data = 0;

    if (enableHumidity) {
      data = smeHumidity.readHumidity();
      SerialUSB.print("\"Humidity\": ");
      SerialUSB.print(data);
      SerialUSB.println(",");
  
      data = smeHumidity.readTemperature();
      SerialUSB.print("\"TemperatureHumidity\": ");
      SerialUSB.print(data);
      SerialUSB.println(",");
    }

    if (enablePressure) {
      data = smePressure.readPressure();
      SerialUSB.print("\"Pressure\": ");
      SerialUSB.print(data);
      SerialUSB.println(",");
  
      data = smePressure.readTemperature();
      SerialUSB.print("\"TemperaturePressure\": ");
      SerialUSB.print(data);
      SerialUSB.println(",");
    }

    if (enableLight) {
      data = smeAmbient.ligthPollingRead();
      SerialUSB.print("\"Light\": ");
      SerialUSB.print(data);
      SerialUSB.println(",");
    }

    if (enableProximity) {
      data = smeProximity.rangePollingRead();
      SerialUSB.print("\"Proximity\": ");
      SerialUSB.print(data);
      SerialUSB.println(",");
    }

    if (enableGPS) {
      printGPS();
      SerialUSB.println(",");
    }
  
    if (nfcOk == true || readNFC==true) {
      // send Manufactoring data on Console
      int i=0;
      SerialUSB.print("\"NFC\": ");
      for (i = 0; i < NFC_PAGE_SIZE; i++) {
        SerialUSB.print(buffer[i], HEX);
        SerialUSB.print(':');
      }
      // Just do it once.
      nfcOk=false;
      readNFC=false;
      SerialUSB.println(",");
    }

    SerialUSB.println("\"end\": 1}");

    ledBlueLight(LOW);    // turn the LED on
    delay(100);            // wait for a second

}

void serialEvent() {
  while (SerialUSB.available()) {
    // get the new byte:
    char inChar = (char)SerialUSB.read();
    
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it:
    if (inChar == '\n' || inChar == '\r') {
      stringComplete = true;

      // Ignore possible pending data after CRLF
      while (SerialUSB.available()) (char)SerialUSB.read();
    } else {
      // add it to the inputString:
      inputString += inChar;
    }
  }
}

void setupNFC() {
  // just clear the buffer
  int i=0;
  readNFC=false;
  for (i = 0; i < NFC_PAGE_SIZE; i++) {
    buffer[i] = 0;
  }

  if (smeNfcDriver.readManufactoringData(buffer)) {
    smeNfc.storeText(NDEFFirstPos, SME_2_1);
    smeNfc.storeUrihttp(NDEFMiddlePos, WEB);
    smeNfc.storeText(NDEFLastPos, FEATURE_READY);
    nfcOk = true;
  }
}


