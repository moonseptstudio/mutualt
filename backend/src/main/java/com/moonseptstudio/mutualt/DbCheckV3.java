package com.moonseptstudio.mutualt;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheckV3 {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://147.93.86.60:5432/mutualtm";
        String user = "moonseptm";
        String password = "dj^38Jek_d,@g$hd";

        try {
            Connection conn = DriverManager.getConnection(url, user, password);
            Statement stmt = conn.createStatement();
            
            System.out.println("Checking FREE package...");
            ResultSet rs = stmt.executeQuery("SELECT * FROM packages WHERE name = 'FREE'");
            if (rs.next()) {
                System.out.println("FREE Package found: ID=" + rs.getLong("id"));
            } else {
                System.out.println("FREE Package NOT FOUND!");
            }
            
            System.out.println("\nChecking OTP tokens for 94755123457...");
            rs = stmt.executeQuery("SELECT * FROM otp_tokens WHERE phone_number = '94755123457'");
            while (rs.next()) {
                System.out.println("OTP: " + rs.getString("otp_code") + " Type: " + rs.getString("type"));
            }
            
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
