// Import dependencies
import React, { useState } from "react";
import "font-awesome/css/font-awesome.min.css";

const FetchDataByDate = () => {
  const [selectedDate, setSelectedDate] = useState({
    fromDate: "",
    toDate: "",
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedField, setSelectedField] = useState("all");
  const [expandedField, setExpandedField] = useState(null);

  const handleDateChange = (e) => {
    setSelectedDate({ ...selectedDate, [e.target.name]: e.target.value });
  };
console.log(selectedField)
  const fetchData = async () => {
  
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://smppintl.datagenit.com/apismpp/v1/billing.php?user_id=1&method=cus_summary_all&date_from=${selectedDate.fromDate}&date_to=${selectedDate.toDate}&token=b8860908f2cf45f721a40d23f2e291f9&user_type=Admin`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      console.log(result);
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (e) => {
    setSelectedField(e.target.value);
    setExpandedField(null);
  };

  const toggleField = (field) => {
    setExpandedField(expandedField === field ? null : field);
  };

  const renderNestedData = (value, parentKey = "") => {
    if (typeof value !== "object" || value === null) return null;

    // const totalCost = calculateTotalCost(value); // Calculate for this specific field
    // const totalSubmissions = calculateTotalSubmissions(value); // Calculate for this specific field

    return (
      <div key={parentKey} style={itemBoxStyle}>
        <h4 style={nestedTitleStyle}>
          {/* {parentKey.toUpperCase()} (Total Cost: {totalCost.toFixed(2)}, Total Submissions: {totalSubmissions}) */}
        </h4>
        {Object.keys(value).map((key) => (
          <div key={key} style={{ marginBottom: "10px"}}>
            <h5 style={subTitleStyle}>{key.toUpperCase()}</h5>
            {renderAttributes(value[key])}
          </div>
        ))}
      </div>
    );
  };

  const renderAttributes = (item) => {
    if (typeof item !== "object" || item === null) return null;
    return (
      <table style={tableStyle}>
        <thead>
          <tr>
            {Object.keys(item).map((key) => (
              <th key={key} style={thStyle}>
                {key.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.entries(item).map(([key, value]) => (
              <td key={key} style={tdStyle}>
                {typeof value === "object" ? renderAttributes(value) : value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  const calculateTotalCost = (data) => {
    let totalCost = 0;
    const recursiveCalculateCost = (value) => {
      if (Array.isArray(value)) {
        value.forEach((item) => recursiveCalculateCost(item));
      } else if (typeof value === "object" && value !== null) {
        if (value.totalcost !== undefined) {
          totalCost += parseFloat(value.totalcost) || 0;
        }
        Object.values(value).forEach((innerValue) =>
          recursiveCalculateCost(innerValue)
        );
      }
    };
    recursiveCalculateCost(data);
    return totalCost;
  };

  const calculateTotalSubmissions = (data) => {
    let totalSubmissions = 0;
    const recursiveCalculate = (value) => {
      if (Array.isArray(value)) {
        value.forEach((item) => recursiveCalculate(item));
      } else if (typeof value === "object" && value !== null) {
        if (value.delivered !== undefined) {
          totalSubmissions += parseInt(value.delivered) || 0;
        }
        if (value.failed !== undefined) {
          totalSubmissions += parseInt(value.failed) || 0;
        }
        if (value.other !== undefined) {
          totalSubmissions += parseInt(value.other) || 0;
        }
        Object.values(value).forEach((innerValue) =>
          recursiveCalculate(innerValue)
        );
      }
    };
    recursiveCalculate(data);
    return totalSubmissions;
  };

  const totalCost = data ? calculateTotalCost(data) : 0;
  const totalSubmissions = data ? calculateTotalSubmissions(data) : 0;

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Customer Billing</h2>
      <div style={inputContainerStyle}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Company</label>
          <select onChange={handleDropdownChange} style={dropdownStyle}>
            <option value="all">All</option>
            {data &&
              Object.keys(data).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
          </select>
        </div>

        <div style={dateInputContainerStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>From Date</label>
            <input
              type="date"
              name="fromDate"
              onChange={handleDateChange}
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>To Date</label>
            <input
              type="date"
              name="toDate"
              onChange={handleDateChange}
              style={inputStyle}
            />
          </div>
        </div>

        <button onClick={fetchData} style={buttonStyle}>
          <i className="fa fa-search" aria-hidden="true"></i> Search
        </button>
      </div>

      {loading && (
        <p style={styleLoading}>
          <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>{" "}
          Loading...
        </p>
      )}
      {error && (
        <p style={{ color: "red" }}>
          <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>{" "}
          {error}
        </p>
      )}
      {data && (
        <>
          <h3 style={headertitle}>
            Total Cost Of All Companies is:{" "}
            <span style={totalCostStyle}>{totalCost.toFixed(2)}</span> and Total
            Submissions is:{" "}
            <span style={totalSubmissionsStyle}>{totalSubmissions}</span>
          </h3>

          {Object.keys(data).filter((item) => {
            const search = selectedField.toLowerCase();
            return search === 'all' ? item : item.toLowerCase().includes(search)}).map((key) => {
                const individualData = data[key];
                const individualTotalCost = calculateTotalCost(individualData);
                const individualTotalSubmissions =
                  calculateTotalSubmissions(individualData);

                return (
                  <div key={key}>
                    <div onClick={() => toggleField(key)} style={toggleStyle}>
                      <strong style={field}>{key} </strong>
                      <h4
                        style={{
                        totalstyle
                        }}
                      >
                        Total Cost:
                        <span
                          style={{
                            color: "#28a745",
                            fontWeight: "bold",
                           
                          }}
                        >
                          {individualTotalCost.toFixed(2)}
                        </span>{" "}
                        Total Submissions:
                        <span
                          style={{
                            color: "#28a745",
                            fontWeight: "bold",
                           
                          }}
                        >
                          {individualTotalSubmissions}
                        </span>
                      </h4>
                      <span style={{ marginLeft: "10px" }}>
                        {expandedField === key ? "-" : "+"}
                      </span>
                    </div>
                    {expandedField === key && renderNestedData(data[key], key)}
                  </div>
                );
              })
            // : selectedField && (
            //     <div style={itemBoxStyle}>
            //       <h4>{selectedField.toUpperCase()}</h4>
            //       {renderNestedData(data[selectedField], selectedField)}
            //     </div>
            //   )}
}
        </>
      )}
    </div>
  );
};
const totalstyle={
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
}
const headertitle = {
  fontSize: "20px",
};
const field = {
  backgroundColor: "black",
  color: "white",
  borderRadius: "3px",
  width: "140px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  marginTop: "15px",
};

const containerStyle = {
  maxWidth: "1000px",
  margin: "20px auto",
  padding: "20px",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const headerStyle = {
  marginBottom: "20px",
  color: "#333",
  textAlign: "left",
};

const inputContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "20px",
};

const dateInputContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  width: "400px",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  marginRight: "10px",
};

const labelStyle = {
  marginBottom: "5px",
};

const dropdownStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  width: "300px",
  backgroundColor: "#fff",
  cursor: "pointer",
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const buttonStyle = {
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "2px",
  cursor: "pointer",
  fontSize: "16px",
  width: "190px",
  height: "40px",
  marginTop: "30px",
};

const styleLoading = {
  color: "blue",
};

const totalCostStyle = {
  color: "green",
  fontWeight: "bold",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  // backgroundColor:"#2AAA8A",
  // color:"white",
};

const totalSubmissionsStyle = {
  color: "blue",
  fontWeight: "bold",
  // backgroundColor:"#2AAA8A",
  // color:"white",
};

const itemBoxStyle = {
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "10px",
  margin: "10px 0",
  
};

const nestedTitleStyle = {
  color: "#555",
  textAlign: "left",
};

const subTitleStyle = {
  color: "#666",
  fontWeight: "bold",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  backgroundColor: "#f2f2f2"
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

const toggleStyle = {
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
  backgroundColor: "#E6E6FA",
  padding: "10px",
  borderRadius: "4px",
  margin: "5px 0",
};

export default FetchDataByDate;
