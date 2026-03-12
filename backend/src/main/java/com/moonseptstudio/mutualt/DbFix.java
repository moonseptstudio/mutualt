package com.moonseptstudio.mutualt;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DbFix {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://147.93.86.60:5432/mutualtm";
        String user = "moonseptm";
        String password = "dj^38Jek_d,@g$hd";

        try {
            Connection conn = DriverManager.getConnection(url, user, password);
            Statement stmt = conn.createStatement();
            stmt.execute("ALTER TABLE messages ALTER COLUMN receiver_id DROP NOT NULL");
            System.out.println("Constraint dropped successfully!");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
