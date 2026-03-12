package com.moonseptstudio.mutualt;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://147.93.86.60:5432/mutualtm";
        String user = "moonseptm";
        String password = "dj^38Jek_d,@g$hd";

        try {
            Connection conn = DriverManager.getConnection(url, user, password);
            Statement stmt = conn.createStatement();
            
            System.out.println("Checking users table...");
            ResultSet rs = stmt.executeQuery("SELECT id, username, password_hash FROM users");
            boolean foundAny = false;
            while (rs.next()) {
                foundAny = true;
                System.out.println("ID: " + rs.getLong("id") + ", Username: " + rs.getString("username") + ", Hash: " + rs.getString("password_hash"));
            }
            if (!foundAny) {
                System.out.println("No users found in database.");
            }
            
            System.out.println("\nChecking for specific user '200100900364'...");
            rs = stmt.executeQuery("SELECT u.id, u.username, p.full_name, p.nic FROM users u JOIN user_profiles p ON u.id = p.user_id WHERE u.username = '200100900364'");
            if (rs.next()) {
                System.out.println("User exists!");
                System.out.println("Name: " + rs.getString("full_name"));
                System.out.println("NIC: " + rs.getString("nic"));
            } else {
                System.out.println("User '200100900364' NOT found.");
            }
            
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
