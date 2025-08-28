import connectDB from "@/app/lib/mongodb";
import { Order } from "@/app/types/pos";
import OrderModel from "@/app/models/Order";
import { NextRequest, NextResponse } from "next/server";