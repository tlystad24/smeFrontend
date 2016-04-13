/*
    smeGyroscope Library - Localization Information

    This example print the 3Axis X,Y,Z information

    created 27 May 2015
    by Seve (speirano@amel-tech.com)

    This example is in the public domain
    https://github.com/ameltech

    LSM9DS1  more information available here:
    http://www.stmicroelectronics.com.cn/web/catalog/sense_power/FM89/SC1448/SC1448/PF259998
 */

#include <Arduino.h>
#include <Wire.h>

#include <LSM9DS1.h>


// the setup function runs once when you press reset or power the board
void setup() {
    smeGyroscope.begin();
    smeAccelerometer.begin();
    SerialUSB.begin(115200);
}

void printAxis(int x, int y, int z) {
    SerialUSB.print("{x: ");
    SerialUSB.print(x, DEC);
    SerialUSB.print(", y: ");
    SerialUSB.print(y, DEC);
    SerialUSB.print(", z: ");
    SerialUSB.print(z, DEC);
    SerialUSB.println("}");
}

// the loop function runs over and over again forever
void loop() {

    int x = 0;
    int y = 0;
    int z = 0;

    x = smeGyroscope.readX();
    y = smeGyroscope.readY();
    z = smeGyroscope.readZ();

    SerialUSB.print("Gyroscope: ");
    printAxis(smeGyroscope.readX(), smeGyroscope.readY(), smeGyroscope.readZ());

    SerialUSB.print("Accelerometer: ");
    printAxis(smeAccelerometer.readX(), smeAccelerometer.readY(), smeAccelerometer.readZ());

    ledBlueLight(LOW);
    delay(100);

    ledBlueLight(HIGH);    // turn the LED on
    delay(500);            // wait for a second

}
