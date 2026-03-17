package com.moonseptstudio.mutualt;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheckV2 {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://147.93.86.60:5432/mutualtm";
        String user = "moonseptm";
        String password = "dj^38Jek_d,@g$hd";

        try {
            Connection conn = DriverManager.getConnection(url, user, password);
            Statement stmt = conn.createStatement();
            
            System.out.println("Checking packages table...");
            ResultSet rs = stmt.executeQuery("SELECT * FROM packages");
            while (rs.next()) {
                System.out.println("ID: " + rs.getLong("id") + ", Name: " + rs.getString("name"));
            }
            
            System.out.println("\nChecking job_categories table...");
            rs = stmt.executeQuery("SELECT * FROM job_categories");
            while (rs.next()) {
                System.out.println("ID: " + rs.getLong("id") + ", Name: " + rs.getString("name"));
            }

            System.out.println("\nChecking user_profiles table structure (nic column)...");
            rs = stmt.executeQuery("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'user_profiles'");
            while (rs.next()) {
                System.out.println("Column: " + rs.getString("column_name") + ", Nullable: " + rs.getString("is_nullable") + ", Default: " + rs.getString("column_default"));
            }
            
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
