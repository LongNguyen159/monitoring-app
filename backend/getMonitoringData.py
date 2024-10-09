import psutil

def get_system_info():
    # Get CPU usage
    cpu_usage = psutil.cpu_percent(interval=1)

    # Get memory usage
    memory_info = psutil.virtual_memory()

    # Get disk usage
    disk_info = psutil.disk_usage('/')

    # Return all information as an object (dictionary)
    return {
        "cpu_usage": cpu_usage,  # as percentage, float
        "memory": {
            "total": memory_info.total / (1024 ** 3),  # in GB, float
            "available": memory_info.available / (1024 ** 3),  # in GB, float
            "used_percent": memory_info.percent  # as percentage, float
        },
        # "disk": {
        #     "total": disk_info.total / (1024 ** 3),  # in GB, float
        #     "used": disk_info.used / (1024 ** 3),  # in GB, float
        #     "used_percent": disk_info.percent  # as percentage, float
        # }
    }

# Example usage
system_info = get_system_info()
print(system_info)
