import connectDB from "@/app/lib/mongodb";
import { Customer } from "@/app/types/pos";
import CustomerModel from "@/app/models/Customer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {

        await connectDB();

        const { name, email, phone, birthDate }: Customer = await req.json();

        const customer = new CustomerModel({ name, email, phone, birthDate });

        await customer.save();

        return NextResponse.json(customer, { status: 201 });

    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
}

export async function GET() {

    try {

        await connectDB();

        const customers = await CustomerModel.find();

        return NextResponse.json(customers);

    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }

}