import { PythonShell } from "python-shell";

export default async (req, res) => {
  if (req.method === "POST") {
    const prompts = req.body.prompts; // Get prompts from the request body
    const options = {
      mode: "text",
      pythonOptions: ["-u"], // unbuffered stdout
      scriptPath: "../../../main2.py",
      args: [JSON.stringify(prompts)],
    };

    PythonShell.run("main2.py", options, function (err, results) {
      if (err) {
        res
          .status(500)
          .send({ message: "Error generating music", error: err.message });
      } else {
        res
          .status(200)
          .send({ message: "Music generated successfully", audio: results[0] });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
