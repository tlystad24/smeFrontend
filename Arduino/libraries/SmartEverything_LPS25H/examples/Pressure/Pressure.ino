/*
 * humidity.cpp
 *
 * Example on SmartEverything Pressure sensor reading
 * In this sketch both pressure and temperature provided by the
 * same sensor (LPS25h) are read
 *
 * Created: 4/27/2015 10:32:11 PM
 *  Author: speirano
 */

#include <Wire.h>

#include <LPS25H.h>
#include <Arduino.h>


// the setup function runs once when you press reset or power the board
void setup() {
    smePressure.begin();
    SerialUSB.begin(115200);
}

// the loop function runs over and over again forever
void loop() {

    int data = 0;

    data = smePressure.readPressure();
    SerialUSB.print("Pressure   : ");
    SerialUSB.print(data);
    SerialUSB.println(" mbar");

    data = smePressure.readTemperature();
    SerialUSB.print("Temperature: ");
    SerialUSB.print(data);
    SerialUSB.println(" celsius");

    ledBlueLight(LOW);
    delay(100);

    ledBlueLight(HIGH);    // turn the LED on
    delay(2000);           // wait for a second

}
